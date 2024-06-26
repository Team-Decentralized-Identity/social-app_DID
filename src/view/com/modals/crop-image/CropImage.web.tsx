import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import ImageEditor from 'react-avatar-editor'
import {Slider} from '@miblanchard/react-native-slider'
import LinearGradient from 'react-native-linear-gradient'
import {Text} from 'view/com/util/text/Text'
import {Dimensions} from 'lib/media/types'
import {getDataUriSize} from 'lib/media/util'
import {s, gradients} from 'lib/styles'
import {usePalette} from 'lib/hooks/usePalette'
import {SquareIcon, RectWideIcon, RectTallIcon} from 'lib/icons'
import {Image as RNImage} from 'react-native-image-crop-picker'
import {Trans, msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useModalControls} from '#/state/modals'

enum AspectRatio {
  Square = 'square',
  Wide = 'wide',
  Tall = 'tall',
}

const DIMS: Record<string, Dimensions> = {
  [AspectRatio.Square]: {width: 1000, height: 1000},
  [AspectRatio.Wide]: {width: 1000, height: 750},
  [AspectRatio.Tall]: {width: 750, height: 1000},
}

export const snapPoints = ['0%']

export function Component({
  uri,
  onSelect,
}: {
  uri: string
  onSelect: (img?: RNImage) => void
}) {
  const {closeModal} = useModalControls()
  const pal = usePalette('default')
  const {_} = useLingui()
  const [as, setAs] = React.useState<AspectRatio>(AspectRatio.Square)
  const [scale, setScale] = React.useState<number>(1)
  const editorRef = React.useRef<ImageEditor>(null)

  const doSetAs = (v: AspectRatio) => () => setAs(v)

  const onPressCancel = () => {
    onSelect(undefined)
    closeModal()
  }
  const onPressDone = () => {
    const canvas = editorRef.current?.getImageScaledToCanvas()
    if (canvas) {
      const dataUri = canvas.toDataURL('image/jpeg')
      onSelect({
        path: dataUri,
        mime: 'image/jpeg',
        size: getDataUriSize(dataUri),
        width: DIMS[as].width,
        height: DIMS[as].height,
      })
    } else {
      onSelect(undefined)
    }
    closeModal()
  }

  let cropperStyle
  if (as === AspectRatio.Square) {
    cropperStyle = styles.cropperSquare
  } else if (as === AspectRatio.Wide) {
    cropperStyle = styles.cropperWide
  } else if (as === AspectRatio.Tall) {
    cropperStyle = styles.cropperTall
  }
  return (
    <View>
      <View style={[styles.cropper, pal.borderDark, cropperStyle]}>
        <ImageEditor
          ref={editorRef}
          style={styles.imageEditor}
          image={uri}
          width={DIMS[as].width}
          height={DIMS[as].height}
          scale={scale}
          border={0}
        />
      </View>
      <View style={styles.ctrls}>
        <Slider
          value={scale}
          onValueChange={(v: number | number[]) =>
            setScale(Array.isArray(v) ? v[0] : v)
          }
          minimumValue={1}
          maximumValue={3}
          containerStyle={styles.slider}
        />
        <TouchableOpacity
          onPress={doSetAs(AspectRatio.Wide)}
          accessibilityRole="button"
          accessibilityLabel={_(msg`Wide`)}
          accessibilityHint="Sets image aspect ratio to wide">
          <RectWideIcon
            size={24}
            style={as === AspectRatio.Wide ? s.blue3 : pal.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doSetAs(AspectRatio.Tall)}
          accessibilityRole="button"
          accessibilityLabel={_(msg`Tall`)}
          accessibilityHint="Sets image aspect ratio to tall">
          <RectTallIcon
            size={24}
            style={as === AspectRatio.Tall ? s.blue3 : pal.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doSetAs(AspectRatio.Square)}
          accessibilityRole="button"
          accessibilityLabel={_(msg`Square`)}
          accessibilityHint="Sets image aspect ratio to square">
          <SquareIcon
            size={24}
            style={as === AspectRatio.Square ? s.blue3 : pal.text}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.btns}>
        <TouchableOpacity
          onPress={onPressCancel}
          accessibilityRole="button"
          accessibilityLabel={_(msg`Cancel image crop`)}
          accessibilityHint="Exits image cropping process">
          <Text type="xl" style={pal.link}>
            Cancel
          </Text>
        </TouchableOpacity>
        <View style={s.flex1} />
        <TouchableOpacity
          onPress={onPressDone}
          accessibilityRole="button"
          accessibilityLabel={_(msg`Save image crop`)}
          accessibilityHint="Saves image crop settings">
          <LinearGradient
            colors={[gradients.blueLight.start, gradients.blueLight.end]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.btn]}>
            <Text type="xl-medium" style={s.white}>
              <Trans>Done</Trans>
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cropper: {
    marginLeft: 'auto',
    marginRight: 'auto',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cropperSquare: {
    width: 400,
    height: 400,
  },
  cropperWide: {
    width: 400,
    height: 300,
  },
  cropperTall: {
    width: 300,
    height: 400,
  },
  imageEditor: {
    maxWidth: '100%',
  },
  ctrls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  slider: {
    flex: 1,
    marginRight: 10,
  },
  btns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  btn: {
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
})
