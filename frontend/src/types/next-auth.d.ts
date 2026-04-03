import "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
