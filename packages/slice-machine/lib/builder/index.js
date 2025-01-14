import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { useIsMounted } from 'react-tidy'

import { ModelContext } from 'src/model-context'
import { ConfigContext } from 'src/config-context'

import { fetchApi } from './fetch'

import Header from './layout/Header'

import {
  Box,
  Label,
  Checkbox
} from 'theme-ui'

import {
  FlexEditor,
  SideBar,
  Success
} from './layout'

import PreviewFields from './modules/PreviewFields'
import MockModal from './modules/MockModal'

const createOnSaveUrl = ({
  sliceName,
  from,
  value,
}) =>
  `/api/update?sliceName=${sliceName}&from=${from}&model=${btoa(JSON.stringify(value))}`

const createStorybookUrls = (storybook, componentInfo, variation = 'default-slice') => ({
  storybookUrl: `${storybook}/?path=/story/${componentInfo.sliceName.toLowerCase()}--${variation}`
})

const Builder = ({ openPanel }) => {
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const Model = useContext(ModelContext)
  const { env: { storybook }, warnings } = useContext(ConfigContext)
  const {
    info,
    value,
    hydrate,
    isTouched,
    mockConfig,
    appendInfo,
    resetInitialModel,
  } = Model

  const isMounted = useIsMounted()
  const [data, setData] = useState({
    imageLoading: false,
    loading: false,
    done: false,
    error: null,
  })

  const variation = Model.get().variation()

  const { storybookUrl } = createStorybookUrls(storybook, info, variation.id)

  useEffect(() => {
    if (isTouched) {
      if (isMounted) {
        setData({ loading: false, done: false, error: null })
      }
    }
  }, [isTouched])

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done) {
      setDisplaySuccess(true)
      setTimeout(() => {
        if (isMounted) {
          setDisplaySuccess(false)
          setData({ ...data, done: false })
        }
      }, 6500)
    } else {
      if (isMounted) {
        setDisplaySuccess(false)
      }
    }
  }, [data])

  const onCloseSuccess = () => {
    if (isMounted) {
      setDisplaySuccess(false)
      setData({ ...data, done: false })
    }
  }


  const onSave = async () => {
    fetchApi({
      url: '/api/update',
      fetchparams: {
        method: 'POST',
        body: JSON.stringify({
          sliceName: info.sliceName,
          from: info.from,
          model: value,
          mockConfig
        })
      },
      setData,
      successMessage: 'Model & mocks have been generated succesfully!',
      onSuccess(json) {
        hydrate(() => resetInitialModel(value, json, mockConfig))
        mutate('/api/state')
      }
    })
  }

  const onPush = async () => {
    fetchApi({
      url: `/api/push?sliceName=${info.sliceName}&from=${info.from}`,
      setData,
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess(json) {
        hydrate(() => resetInitialModel(value, json, mockConfig))
        mutate('/api/state')
      }
    })
  }

  const onScreenshot = async () => {
    fetchApi({
      url: `/api/screenshot?sliceName=${info.sliceName}&from=${info.from}`,
      setData,
      setDataParams: [{ imageLoading: true }, { imageLoading: false }],
      successMessage: 'New screenshot added!',
      onSuccess(json) {
        hydrate(appendInfo(json))
      }
    })
  }

  const onCustomScreenshot = async (file) => {
    const form = new FormData()
    Object.entries({ sliceName: info.sliceName, from: info.from })
      .forEach(([key, value]) => form.append(key, value))
    form.append('file', file)
    fetchApi({
      url: '/api/custom-screenshot',
      setData,
      fetchparams: {
        method: 'POST',
        body: form,
        headers: {}
      },
      setDataParams: [{ imageLoading: true }, { imageLoading: false }],
      successMessage: 'New screenshot added!',
      onSuccess(json) {
        hydrate(appendInfo(json))
      }
    })
  }
  const DEFAULT_CHECKED = false;
  const [showHints, setShowHints] = useState(DEFAULT_CHECKED);
  const onToggleHints = () => setShowHints(!showHints);

  return (
    <Box>
      <Header info={info} Model={Model} />

      <Success
        data={data}
        onClose={onCloseSuccess}
        display={displaySuccess}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={() => (
          <SideBar
            isTouched={isTouched}
            info={info}
            onPush={onPush}
            onSave={onSave}
            data={data}
            warnings={warnings}
            openPanel={openPanel}
            previewUrl={info.previewUrl}
            storybookUrl={storybookUrl}
            onScreenshot={onScreenshot}
            onHandleFile={onCustomScreenshot}
            imageLoading={data.imageLoading}
          />
        )}
      >

        <Label variant="hint" sx={{ justifyContent: 'flex-end', py: 2, px: 0 }}>
          Show code snippets
          <Checkbox
            sx={{ margin: '0 8px' }}
            defaultChecked={DEFAULT_CHECKED}
            onChange={onToggleHints}
          />
        </Label>
        
          <PreviewFields
            Model={Model}
            variation={variation}
            showHints={showHints}
          />

      </FlexEditor>
      {
        false ? (
          <MockModal
            close={console.log}
            variation={variation}
            Model={Model}
          />
        ) : null
      }
    </Box>
  )
}

export default Builder