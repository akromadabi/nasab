import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            role: "SUPER_ADMIN" | "ADMIN" | "USER";
            status: "PENDING" | "APPROVED" | "SUSPENDED";
        };
    }

    interface User {
        id: string;
        role: "SUPER_ADMIN" | "ADMIN" | "USER";
        status: "PENDING" | "APPROVED" | "SUSPENDED";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "SUPER_ADMIN" | "ADMIN" | "USER";
        status: "PENDING" | "APPROVED" | "SUSPENDED";
    }
}

// Application types
export interface MemberNode {
    id: string;
    fullName: string;
    nickname?: string | null;
    gender: "MALE" | "FEMALE";
    birthDate?: string | null;
    deathDate?: string | null;
    isAlive: boolean;
    photo?: string | null;
    phoneWhatsapp?: string | null;
    generation: number;
    fatherId?: string | null;
    motherId?: string | null;
    children?: MemberNode[];
    spouses?: SpouseInfo[];
}

export interface SpouseInfo {
    member: MemberNode;
    marriageDate?: string | null;
    divorceDate?: string | null;
    isActive: boolean;
    marriageOrder: number;
}

export interface TreeData {
    root: MemberNode;
    totalMembers: number;
    totalGenerations: number;
}

export interface BaniStats {
    totalMembers: number;
    totalAlive: number;
    totalDeceased: number;
    totalMale: number;
    totalFemale: number;
    totalGenerations: number;
    totalMarriages: number;
}

export interface ActivityLogEntry {
    id: string;
    action: string;
    entityType: string;
    description: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string | null;
    };
}
