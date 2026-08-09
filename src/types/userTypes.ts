
export type registerType = {
    username:string,
    name:string;
    email:string;
    role:"user" | "admin";
    password:string
}

export type loginType = {
    identifier: string;
    password:string
}

