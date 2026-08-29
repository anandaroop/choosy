import NextAuth, { NextAuthOptions } from "next-auth"

import * as authCallbacks from "utils/authCallbacks"

const GRAVITY_URL = process.env.GRAVITY_URL as string
const CLIENT_APPLICATION_ID = process.env.CLIENT_APPLICATION_ID as string
const CLIENT_APPLICATION_SECRET = process.env
  .CLIENT_APPLICATION_SECRET as string

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "artsy",
      name: "Artsy",
      type: "oauth",
      clientId: CLIENT_APPLICATION_ID,
      clientSecret: CLIENT_APPLICATION_SECRET,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        url: `${GRAVITY_URL}/oauth2/authorize`,
        params: { scope: "offline_access" },
      },
      token: {
        url: `${GRAVITY_URL}/oauth2/access_token?on_success=200`,
        params: { on_success: 200 },
      },
      userinfo: {
        url: `${GRAVITY_URL}/api/v1/me`,
        async request({ tokens }) {
          const response = await fetch(`${GRAVITY_URL}/api/v1/me`, {
            headers: { "X-Access-Token": tokens.access_token as string },
          })
          return response.json()
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          roles: profile.roles ?? [],
        }
      },
    },
  ],
  callbacks: {
    signIn: authCallbacks.signIn,
    jwt: authCallbacks.jwt,
    session: authCallbacks.session,
  },
  pages: {
    error: "/auth/error",
  },
}

export default NextAuth(authOptions)
