export interface IUser {
    _id: string;
    name: string;
    email: string;
    pass: string;
    salt: string;
    admin: boolean;
}

export interface IUserRegisterDTO {
    name: string;
    email: string;
    pass: string;
    admin: boolean;
}

export interface IUserLoginDTO {
    email: string;
    pass: string;
}
