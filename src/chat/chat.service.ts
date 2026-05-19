import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';

@Injectable()
export class ChatService {
  // Predefined restaurant menu
  private readonly menu = [
    { id: '11', name: 'Jollof Rice & Chicken', price: 3500 },
    { id: '12', name: 'Pounded Yam & Egusi Soup', price: 4000 },
    { id: '13', name: 'Beef Burger & Fries', price: 4500 },
    { id: '14', name: 'Asun (Spicy Roasted Goat)', price: 3000 },
  ];

  private readonly initialOptions = `
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order`;

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async processMessage(deviceId: string, message: string): Promise<{ response: string }> {
    const cleanMessage = message?.trim();

    //  Fetch or create session for the device
    let session = await this.sessionModel.findOne({ deviceId });
    if (!session) {
      session = await this.sessionModel.create({
        deviceId,
        currentState: 'MAIN_MENU',
        currentOrder: [],
        orderHistory: [],
      });
      return { response: `Welcome to our Restaurant! Please select an option:${this.initialOptions}` };
    }

    //  Handle state or input logic
    switch (cleanMessage) {
      case '1':
        session.currentState = 'VIEWING_MENU';
        await session.save();
        return { response: this.getMenuText() };

      case '97':
        return { response: this.getCurrentOrderText(session.currentOrder) };

      case '0':
        if (session.currentOrder.length === 0) {
          return { response: `No active order to cancel.\n${this.initialOptions}` };
        }
        session.currentOrder = [];
        session.currentState = 'MAIN_MENU';
        await session.save();
        return { response: `Your current order has been cancelled.\n${this.initialOptions}` };

      case '98':
        return { response: this.getOrderHistoryText(session.orderHistory) };

      case '99':
        if (session.currentOrder.length === 0) {
          return { response: `No order to place. Please select an option to start:${this.initialOptions}\nSelect 1 to place a new order.` };
        }
        // Next step will integrate actual Paystack link generation here
        session.currentState = 'AWAITING_PAYMENT';
        await session.save();
        return { response: `Order summary built. Proceed to payment details (Paystack logic coming next).\nSelect 0 to cancel.` };

      default:
        // Handle menu item selection if user is in VIEWING_MENU state
        if (session.currentState === 'VIEWING_MENU') {
          const selectedItem = this.menu.find((item) => item.id === cleanMessage);
          if (selectedItem) {
            session.currentOrder.push(selectedItem);
            await session.save();
            return {
              response: `Added ${selectedItem.name} (₦${selectedItem.price}) to your cart.\n\nSelect another item code to add more, or choose from options:${this.initialOptions}`,
            };
          }
        }
        return { response: `Invalid option. Please choose correctly:${this.initialOptions}` };
    }
  }

  private getMenuText(): string {
    let menuText = 'Our Menu:\n';
    this.menu.forEach((item) => {
      menuText += `Select ${item.id} for ${item.name} - ₦${item.price}\n`;
    });
    menuText += `\nSelect 97 to view cart, or 99 to checkout.`;
    return menuText;
  }

  private getCurrentOrderText(currentOrder: any[]): string {
    if (currentOrder.length === 0) {
      return `Your current order cart is empty.\n${this.initialOptions}`;
    }
    let text = 'Your Current Order:\n';
    let total = 0;
    currentOrder.forEach((item, index) => {
      text += `${index + 1}. ${item.name} - ₦${item.price}\n`;
      total += item.price;
    });
    text += `\nTotal: ₦${total}\n${this.initialOptions}`;
    return text;
  }

  private getOrderHistoryText(orderHistory: any[]): string {
    if (orderHistory.length === 0) {
      return `You have no past orders.\n${this.initialOptions}`;
    }
    let text = 'Your Order History:\n';
    orderHistory.forEach((order, index) => {
      text += `Order #${index + 1}: ${order.items.map((i: any) => i.name).join(', ')} - Total: ₦${order.total} (${order.status})\n`;
    });
    text += `\n${this.initialOptions}`;
    return text;
  }
}