import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';

export class OrderDetailResponse {
  id: number;
  productName: string;
  productImage: string;
  optionValue: string[];
  quantity: number;
  price: number;
}

export class PaymentResponse {
  paymentMethod: string;
  paymentDate: string | null;
  totalPrice: number;
  status: string;
  transactionId: string | null;
}

export class OrderResponse {
  id: number;
  userId: number;
  userName: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: string;
  orderDetails: OrderDetailResponse[];
  payment: PaymentResponse;
}
