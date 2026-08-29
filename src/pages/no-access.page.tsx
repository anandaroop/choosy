import { GetServerSideProps } from "next"
import { useRouter } from "next/router"

import { getSessionUser } from "utils/auth"

interface NoAccessProps {
  email: string | null
  userId: string | null
}

export default function NoAccess({ email, userId }: NoAccessProps) {
  const router = useRouter()
  const reason = router.query.reason

  const isUnavailable = reason === "unleash-unavailable"

  return (
    <div>
      <h1>{isUnavailable ? "Couldn't verify access" : "Access not enabled"}</h1>
      {isUnavailable ? (
        <p>
          We couldn&apos;t verify your access right now. Please try reloading in
          a moment.
        </p>
      ) : (
        <p>
          You&apos;re signed in, but this account isn&apos;t enrolled in the
          labeling tool yet. To request access, share the details below.
        </p>
      )}
      {email && (
        <p>
          Email: <strong>{email}</strong>
        </p>
      )}
      {userId && (
        <p>
          Gravity user id: <strong>{userId}</strong>
        </p>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<NoAccessProps> = async (
  ctx
) => {
  const user = await getSessionUser({ req: ctx.req, res: ctx.res })

  return {
    props: {
      email: user?.email ?? null,
      userId: user?.id ?? null,
    },
  }
}
