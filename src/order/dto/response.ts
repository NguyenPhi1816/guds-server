import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';

export type OrderDto = {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: OrderStatus;
};

export type OrderDetailDto = {
  id: number;
  productVariantId: number;
  quantity: number;
  price: number;
};

export type OrderPaymentDto = {
  id: number;
  paymentMethod: PaymentMethod;
  paymentDate: string | null;
  totalPrice: number;
  status: PaymentStatus;
  transactionId: string | null;
};

export type CreateOrderResponseDto = {
  order: OrderDto;
  orderDetails: OrderDetailDto[];
  payment: OrderPaymentDto;
};

export class ReviewResponse {
  id: number;
  comment: string;
  rating: number;
  createdAt: string;
  updateAt: string | null;
}

export class OrderDetailResponse {
  id: number;
  productName: string;
  productImage: string;
  optionValue: string[];
  quantity: number;
  price: number;
  review: ReviewResponse | null;
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
