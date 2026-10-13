import {
	cloneElement,
	isValidElement,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import {
	Animated,
	View as NativeView,
	PanResponder,
	StyleSheet,
} from 'react-native'
import { initialTransform, moveImage } from './touch-transform'
import { maximumImageZoom } from './zoom'
import type { ReactElement, ReactNode, Ref } from 'react'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import type { TouchPoint } from './touch-transform'

type ZoomHandle = {
	zoomTo(point: { x: number; y: number }): void
	unzoom(): void
}
type ViewerProps = {
	children?: ReactNode
	style?: StyleProp<ViewStyle>
	ref?: Ref<ZoomHandle>
	maximumZoomScale?: number
	onZoomChanged?: (event: { nativeEvent: { zoomScale: number } }) => void
}
const resets = new Set<() => void>()
export function resetRotations() {
	for (const reset of resets) reset()
}

export default function RotationSurface({
	viewer,
}: {
	viewer: ReactElement<ViewerProps>
}) {
	const [active, setActive] = useState(true)
	const enabled = useRef(true)
	const transform = useRef(initialTransform())
	const previous = useRef<readonly TouchPoint[]>([])
	const rotation = useRef(new Animated.Value(0)).current
	const scale = useRef(new Animated.Value(1)).current
	const x = useRef(new Animated.Value(0)).current
	const y = useRef(new Animated.Value(0)).current
	const reportedZoom = useRef(false)
	const props = useRef(viewer.props)
	props.current = viewer.props
	const detector = viewer.props.children
	const supported = isValidElement<{ children?: ReactNode }>(detector)
	const apply = () => {
		const value = transform.current
		rotation.setValue(value.rotation)
		scale.setValue(value.scale)
		x.setValue(value.x)
		y.setValue(value.y)
		const zoomed = value.scale > 1
		if (zoomed !== reportedZoom.current) {
			reportedZoom.current = zoomed
			props.current.onZoomChanged?.({ nativeEvent: { zoomScale: value.scale } })
		}
	}
	const resetTransform = () => {
		previous.current = []
		transform.current = initialTransform()
		apply()
	}
	useImperativeHandle(viewer.props.ref, () => ({
		zoomTo: resetTransform,
		unzoom: resetTransform,
	}))
	const responder = useMemo(() => {
		const capture = (event: GestureResponderEvent) =>
			enabled.current &&
			(event.nativeEvent.touches.length >= 2 || transform.current.scale > 1)
		const remember = (event: GestureResponderEvent) => {
			previous.current = event.nativeEvent.touches.map(touch => ({
				identifier: touch.identifier,
				pageX: touch.pageX,
				pageY: touch.pageY,
			}))
		}
		return PanResponder.create({
			onStartShouldSetPanResponderCapture: event =>
				enabled.current && event.nativeEvent.touches.length >= 2,
			onMoveShouldSetPanResponderCapture: (event, gesture) =>
				capture(event) &&
				(event.nativeEvent.touches.length >= 2 ||
					Math.hypot(gesture.dx, gesture.dy) > 3),
			onPanResponderGrant: remember,
			onPanResponderMove(event) {
				if (!enabled.current) return
				const touches = event.nativeEvent.touches
				transform.current = moveImage(
					transform.current,
					previous.current,
					touches,
					maximumImageZoom,
				)
				remember(event)
				apply()
			},
			onPanResponderRelease() {
				previous.current = []
			},
			onPanResponderTerminate() {
				previous.current = []
			},
			onPanResponderTerminationRequest: () => false,
			onShouldBlockNativeResponder: () => true,
		})
	}, [rotation, scale, x, y])
	useEffect(() => {
		const reset = () => {
			enabled.current = false
			transform.current = initialTransform()
			apply()
			setActive(false)
		}
		resets.add(reset)
		return () => {
			resets.delete(reset)
		}
	}, [])
	if (!active || !supported) return viewer
	return (
		<NativeView
			collapsable={false}
			style={viewer.props.style}
			{...responder.panHandlers}
		>
			{cloneElement(
				detector,
				{},
				<Animated.View
					collapsable={false}
					style={[
						StyleSheet.absoluteFill,
						{
							transform: [
								{ translateX: x },
								{ translateY: y },
								{ scale },
								{
									rotate: rotation.interpolate({
										inputRange: [-Math.PI, Math.PI],
										outputRange: ['-180deg', '180deg'],
										extrapolate: 'extend',
									}),
								},
							],
						},
					]}
				>
					{detector.props.children}
				</Animated.View>,
			)}
		</NativeView>
	)
}
