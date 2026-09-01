import { Box, Text } from "@artsy/palette"

/**
 * The signed-out case is handled app-wide by Layout, so this page can
 * assume a signed-in user reaches it.
 */
export default function Home() {
  return (
    <Box textAlign="center" py={4}>
      <Text variant="xxl">Welcome to Choosy</Text>
    </Box>
  )
}
