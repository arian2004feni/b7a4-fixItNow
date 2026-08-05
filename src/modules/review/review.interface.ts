export interface ICreateReviewPayload {
  bookingId: string;
  comment: string;
  rating?: number;
}
