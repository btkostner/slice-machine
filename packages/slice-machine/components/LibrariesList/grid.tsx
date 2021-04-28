import { Box } from 'theme-ui'

const Grid = ({ elems, renderElem }: { elems: any, renderElem: Function }) => {
  return (
    <Box
      as="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gridGap: '16px',
        pt: 2,
        mb: 3
      }}
    >
      { elems.map((elem: any) => renderElem(elem) )}
    </Box>
  )

}

export default Grid