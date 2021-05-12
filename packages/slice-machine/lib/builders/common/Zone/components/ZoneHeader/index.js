import { Flex } from 'theme-ui'

const ZoneHeader = ({ Heading, Actions }) => (
  <Flex
    bg="zoneHeader"
    sx={{
      pl: 3,
      pr: 2,
      py: 2,
      mb: 2,
      borderRadius: "6px",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Flex sx={{ alignItems: "center" }}>
      { Heading }
    </Flex>
    <Flex sx={{ alignItems: "center" }}>
      { Actions }
    </Flex>
  </Flex>
)

export default ZoneHeader