export interface AddressInfoResponse {
  id: string;
  createdAt: Date;
  city: string;
  street: string;
  house: string;
  latitude: number;
  longitude: number;
  label: string | null;
}
