import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class ChatService {
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
        private readonly paymentService: PaymentService,
    ) { }

    async processMessage(deviceId: string, message: string): Promise<{ response: string }> {
        // --- ADDING LOGS BACK HERE ---
        console.log('=== CHAT INCOMING REQUEST ===');
        console.log('1. DEVICE ID:', deviceId);
        console.log('2. RAW MESSAGE CONTENT:', JSON.stringify(message));

        const cleanMessage = message !== undefined && message !== null ? String(message).trim() : '';
        console.log('3. CLEANED MESSAGE STRING:', JSON.stringify(cleanMessage));

        let session = await this.sessionModel.findOne({ deviceId });
        if (!session) {
            console.log('4. DATABASE STATUS: No session found. Creating a new one.');
            session = await this.sessionModel.create({
                deviceId,
                currentState: 'MAIN_MENU',
                currentOrder: [],
                orderHistory: [],
            });
        }

        console.log('5. CURRENT STATE IN DB BEFORE UPDATE:', session.currentState);
        console.log('6. CURRENT CART CONTENT IN DB:', JSON.stringify(session.currentOrder));

        // Failsafe: Empty message handler
        if (!cleanMessage) {
            console.log('-> Action: Message is empty. Forcing state back to MAIN_MENU text.');
            session.currentState = 'MAIN_MENU';
            await session.save();
            return { response: `Welcome to our Restaurant!\n\n${this.initialOptions}` };
        }

        switch (cleanMessage) {
            case '1':
                console.log('-> Action: Matched option 1. Changing state to VIEWING_MENU.');
                session.currentState = 'VIEWING_MENU';
                await session.save();
                return { response: this.getMenuText() };

            case '97':
                console.log('-> Action: Matched option 97. Displaying current cart.');
                return { response: this.getCurrentOrderText(session.currentOrder) };

            case '0':
                console.log('-> Action: Matched option 0. Resetting session data to empty.');
                session.currentOrder = [];
                session.currentState = 'MAIN_MENU';
                session.email = null;
                await session.save();
                return { response: `Your current order has been cancelled.\n${this.initialOptions}` };

            case '98':
                console.log('-> Action: Matched option 98. Displaying order history.');
                return { response: this.getOrderHistoryText(session.orderHistory) };

            case '99':
                console.log('-> Action: Matched option 99. Checkout initialization triggered.');
                if (!session.currentOrder || session.currentOrder.length === 0) {
                    console.log('-> Order array is empty. Refusing checkout state transition.');
                    session.currentState = 'MAIN_MENU';
                    await session.save();
                    return { response: `No order to place. Please select an option to start:${this.initialOptions}\nSelect 1 to place a new order.` };
                }
                session.currentState = 'AWAITING_EMAIL';
                await session.save();
                console.log('-> State changed to AWAITING_EMAIL.');
                return { response: `Please type your email address to receive your payment receipt directly from Paystack:` };

            default:
                if (session.currentState === 'AWAITING_EMAIL') {
                    console.log('-> Default Action: Handling input inside AWAITING_EMAIL state loop.');
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    
                    if (!emailRegex.test(cleanMessage)) {
                        console.log('-> Validation Outcome: EMAIL VALIDATION FAILED for input:', JSON.stringify(cleanMessage));
                        return { response: `❌ Invalid email address format. Please type a valid email address:` };
                    }

                    console.log('-> Validation Outcome: EMAIL PASSED. Saving:', cleanMessage);
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
                        console.log('-> Payment Service Error:', error);
                        return { response: `Failed to initialize payment. Please type your email to try again.` };
                    }
                }

                if (session.currentState === 'VIEWING_MENU') {
                    console.log('-> Default Action: Handling input inside VIEWING_MENU state loop.');
                    const selectedItem = this.menu.find((item) => item.id === cleanMessage);
                    if (selectedItem) {
                        const updatedOrder = [...session.currentOrder, selectedItem];
                        session.currentOrder = updatedOrder;
                        await this.sessionModel.updateOne(
                            { deviceId },
                            { $set: { currentOrder: updatedOrder } }
                        );
                        console.log(`-> Item added successfully: ${selectedItem.name}. New cart size: ${updatedOrder.length}`);
                        return {
                            response: `Added ${selectedItem.name} (₦${selectedItem.price}) to your cart.\n\nSelect another item code to add more, or choose from options:${this.initialOptions}`,
                        };
                    }
                    console.log('-> Selection mismatch. Code did not match any items in the menu arrays.');
                }

                console.log('-> Default Action: No states or options matched. Returning standard fallback message.');
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