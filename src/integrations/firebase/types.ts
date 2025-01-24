export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  balance: number; // Assuming barbers have a balance
}

export interface ProductionResult {
  id: string;
  barberName: string;
  serviceName: string;
  date: string; // Or Date type if you are using Date objects
}
