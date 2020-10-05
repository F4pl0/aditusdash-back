export interface IMachine {
    _id: string;
    location: string;
    image: string;
    item: string;
    stock: number;
    maxStock: number;
    price: number;
    locationPrice: number;
}

export interface IMachineNewDTO {
    location: string;
    image: string;
    item: string;
    stock: number;
    maxStock: number;
    price: number;
    locationPrice: number;
}

export interface IMachineUpdateDTO {
    _id: string;
    location: string;
    image: string;
    item: string;
    stock: number;
    maxStock: number;
    price: number;
    locationPrice: number;
}

export interface IMachineRestockDTO {
    _id: string;
    stock: number;
}

