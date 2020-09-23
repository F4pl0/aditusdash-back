export interface IUser {
    _id: string;
    name: string;
    email: string;
    pass: string;
    salt: string;
}

export interface IUserRegisterDTO {
    name: string;
    email: string;
    pass: string;
}

export interface IUserLoginDTO {
    email: string;
    pass: string;
}
