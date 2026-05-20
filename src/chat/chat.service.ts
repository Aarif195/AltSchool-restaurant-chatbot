
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { PaymentService } from 'src/payment/payment.service';

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
    Please select an option to continue:
    Select 1 to Place an order
    Select 99 to checkout order
    Select 98 to see order history
    Select 97 to see current order
    Select 0 to cancel order`;

    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
        private readonly paymentService: PaymentService,
    ) { }

    async processMessage(deviceId: string, message: string): Promise<{ response: string }> {
        const cleanMessage = message?.trim();

        // Fetch or create session for the device
        let session = await this.sessionModel.findOne({ deviceId });
        if (!session) {
            session = await this.sessionModel.create({
                deviceId,
                currentState: 'MAIN_MENU',
                currentOrder: [],
                orderHistory: [],
            });
        }

       
        if (cleanMessage === 'PAYMENT_REDIRECT_SUCCESS' || session.currentState === 'PAYMENT_SUCCESSFUL') {
            
            if (session.currentOrder.length > 0) {
                const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);
                session.orderHistory.push({
                    items: session.currentOrder,
                    total,
                    status: 'paid',
                    paidAt: new Date(),
                });
            }

            session.currentOrder = [];
            session.currentState = 'MAIN_MENU';
            session.email = null;
            await session.save();
            return { response: `Thank you! Your payment was successful and your order has been placed.\n\n${this.initialOptions}` };
        }

    

        if (!cleanMessage) {
            session.currentState = 'MAIN_MENU';
            await session.save();
            return { response: `Welcome to our Restaurant!\n\n${this.initialOptions}` };
        }

        // Explicit command matching takes absolute priority over current states
        switch (cleanMessage) {
            case '1':
                session.currentState = 'VIEWING_MENU';
                await session.save();
                return { response: this.getMenuText() };

            case '97':
                return { response: this.getCurrentOrderText(session.currentOrder) };

            case '0':
                if (session.currentOrder.length === 0) {
                    session.currentState = 'MAIN_MENU';
                    await session.save();
                    return { response: `No active order to cancel.\n${this.initialOptions}` };
                }
                session.currentOrder = [];
                session.currentState = 'MAIN_MENU';
                session.email = null;
                await session.save();
                return { response: `Your current order has been cancelled.\n${this.initialOptions}` };

            case '98':
                return { response: this.getOrderHistoryText(session.orderHistory) };

            case '99':
                if (!session.currentOrder || session.currentOrder.length === 0) {
                    session.currentState = 'MAIN_MENU';
                    await session.save();
                    return { response: `No order to place. Please select an option to start:${this.initialOptions}\nSelect 1 to place a new order.` };
                }

                session.currentState = 'AWAITING_EMAIL';
                await session.save();
                return { response: `Please type your email address to receive your payment receipt directly from Paystack:` };

            default:
                // Handle email collection only if explicitly in that state and no matching code was hit
                if (session.currentState === 'AWAITING_EMAIL') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(cleanMessage)) {
                        return { response: `Invalid email address format. Please type a valid email address:` };
                    }

                    session.email = cleanMessage;
                    await session.save();

                    try {
                        const totalAmount = session.currentOrder.reduce((sum, item) => sum + item.price, 0);

                        const paymentData = await this.paymentService.initializeTransaction(
                            totalAmount,
                            session.email,
                            { deviceId },
                        );

                        session.currentState = 'AWAITING_PAYMENT';
                        await session.save();

                        return {
                            response: `Your total is ₦${totalAmount}. Please complete your payment using this secure link:\n\n${paymentData.authorization_url}\n\nOnce payment is complete, you will be automatically updated here. Select 0 to cancel.`
                        };
                    } catch (error) {
                        return { response: `Failed to initialize payment. Please type your email to try again.` };
                    }
                }

                // Handle menu selection if currently viewing menu items
                if (session.currentState === 'VIEWING_MENU') {
                    const selectedItem = this.menu.find((item) => item.id === cleanMessage);
                    if (selectedItem) {
                        const updatedOrder = [...session.currentOrder, selectedItem];
                        session.currentOrder = updatedOrder;

                        await this.sessionModel.updateOne(
                            { deviceId },
                            { $set: { currentOrder: updatedOrder } }
                        );

                        return {
                            response: `Added ${selectedItem.name} (₦${selectedItem.price}) to your cart.\n\nSelect another item code to add more, or choose from options:${this.initialOptions}`,
                        };
                    }
                }

                // Standard fallback for completely unrecognizable options
                return { response: `Invalid option. Please choose correctly:${this.initialOptions}` };
        }
    }

    // getMenuText
    private getMenuText(): string {
        let menuText = 'Our Menu:\n';
        this.menu.forEach((item) => {
            menuText += `Select ${item.id} for ${item.name} - ₦${item.price}\n`;
        });
        menuText += `\nSelect 97 to view cart, or 99 to checkout.`;
        return menuText;
    }

    // getCurrentOrderText
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

// getOrderHistoryText
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