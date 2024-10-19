import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Mod = {
    id: string;
    name: string;
    link: string;
    type: string;
};
export type ModConflict = {
    A: string;
    B: string;
};
export type ModDependency = {
    A: string;
    B: string;
};
export type ModFile = {
    id: string;
    mod_id: string;
    version: string;
    filename: string;
    /**
     * @kyselyType(boolean)
     */
    isOptional: Generated<boolean>;
    serverId: string | null;
};
export type SecurityAction = {
    id: string;
    user_id: string;
    timestamp: Generated<string>;
    /**
     * @kyselyType('LOGIN' | "SERVER_JOIN")
     */
    type: 'LOGIN' | "SERVER_JOIN";
    /**
     * @kyselyType('SITE' | 'LAUNCHER' | 'SERVER')
     */
    location: 'SITE' | 'LAUNCHER' | 'SERVER';
    ip: string;
};
export type Server = {
    id: string;
    uuid: string;
    name: string;
    description: string;
    icon: string;
    ip: string;
    port: number;
    ownerId: string;
    createdAt: Generated<string>;
    /**
     * @kyselyType('ACTIVE' | 'HIDDEN' | 'ARCHIVED')
     */
    status: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
    /**
     * @kyselyType(boolean)
     */
    hasLinkAccess: Generated<boolean>;
};
export type ServerUser = {
    A: string;
    B: string;
};
export type Session = {
    id: string;
    token: string;
    refreshToken: string;
    serverId: string | null;
    device: string;
    location: string;
    /**
     * @kyselyType("SITE" | "LAUNCHER")
     */
    type: "SITE" | "LAUNCHER";
    last_login: Generated<string>;
    expires_at: string;
    user_id: string;
};
export type User = {
    id: string;
    uuid: string;
    username: string;
    email: string;
    password: string;
    /**
     * @kyselyType(boolean)
     */
    salted: Generated<boolean>;
    salt: string;
    /**
     * @kyselyType(boolean)
     */
    verified: Generated<boolean>;
    regDate: Generated<string>;
    /**
     * @kyselyType('PLAYER' | 'MODERATOR' | 'ADMIN')
     */
    role: Generated<'PLAYER' | 'MODERATOR' | 'ADMIN'>;
    lastPlayed: string | null;
};
export type DB = {
    _ModConflict: ModConflict;
    _ModDependency: ModDependency;
    _ServerUser: ServerUser;
    Mod: Mod;
    ModFile: ModFile;
    SecurityAction: SecurityAction;
    Server: Server;
    Session: Session;
    User: User;
};
