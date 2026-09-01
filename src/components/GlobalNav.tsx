import { Session } from "next-auth"
import Link from "next/link"
import { useRouter } from "next/router"
import { Clickable, Flex, Text } from "@artsy/palette"
import ArtsyMarkIcon from "@artsy/icons/ArtsyMarkIcon"

import { federatedSignOut } from "utils/federatedSignOut"

interface GlobalNavProps {
  user?: Session["user"]
}

/**
 * Persistent top nav bar, rendered by Layout above every page. Signed-out
 * shows only the logo; signed-in adds the "Label" link and a user/logout
 * area — mirrors orbit's GlobalNav (choosy's scaffolding ancestor).
 */
export function GlobalNav({ user }: GlobalNavProps) {
  const router = useRouter()
  const labelActive = router.pathname.startsWith("/label")

  return (
    <Flex
      bg="mono100"
      color="mono0"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
      py={1}
      px={[1, 2]}
    >
      <Flex alignItems="center" gap={2}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          <ArtsyMarkIcon fill="mono0" width={32} height={32} />
        </Link>
        {user && (
          <Link
            href="/label"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Text
              variant="sm"
              style={{
                opacity: labelActive ? 1 : 0.7,
                textDecoration: labelActive ? "underline" : "none",
                whiteSpace: "nowrap",
              }}
            >
              Label
            </Text>
          </Link>
        )}
      </Flex>
      {user && (
        <Flex alignItems="center" gap={1}>
          <Text
            variant="xs"
            color="mono30"
            display={["none", "block"]}
            style={{ whiteSpace: "nowrap" }}
          >
            {user.email}
          </Text>
          <Clickable onClick={() => federatedSignOut()}>
            <Text variant="sm" style={{ whiteSpace: "nowrap" }}>
              Log out
            </Text>
          </Clickable>
        </Flex>
      )}
    </Flex>
  )
}
