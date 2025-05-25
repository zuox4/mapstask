import { useState, useEffect, useRef } from 'react'
import { YMaps, Map, Placemark, Polyline } from '@pbe/react-yandex-maps'

interface Position {
	coords: {
		latitude: number
		longitude: number
		accuracy?: number
		altitude?: number | null
		altitudeAccuracy?: number | null
		heading?: number | null
		speed?: number | null
	}
	timestamp?: number
}

interface MapRef {
	setCenter: (coordinates: [number, number]) => void
	geoObjects?: unknown
	events?: unknown
	getBounds?: () => unknown
}

const TrackerMap = () => {
	const [position, setPosition] = useState<[number, number]>([55.75, 37.57]) // Начальные координаты (Москва)
	const [tracking, setTracking] = useState<boolean>(false)
	const [path, setPath] = useState<[number, number][]>([])
	const mapRef = useRef<MapRef | null>(null)
	const watchId = useRef<number | null>(null)

	// Функция успешного получения геолокации
	const handleSuccess = (pos: Position) => {
		const { latitude, longitude } = pos.coords
		const newPosition: [number, number] = [latitude, longitude]
		setPosition(newPosition)
		setPath(prev => [...prev, newPosition])

		// Автоматическое перемещение карты
		if (mapRef.current) {
			mapRef.current.setCenter(newPosition)
		}
	}

	// Функция обработки ошибок геолокации
	const handleError = (err: GeolocationPositionError) => {
		console.error(`Ошибка геолокации: ${err.message}`)
		alert('Не удалось получить ваше местоположение')
	}

	// Запуск/остановка отслеживания
	const toggleTracking = () => {
		if (tracking) {
			if (watchId.current !== null) {
				navigator.geolocation.clearWatch(watchId.current)
			}
			setTracking(false)
		} else {
			const options: PositionOptions = {
				enableHighAccuracy: true,
				maximumAge: 0,
				timeout: 5000,
			}

			watchId.current = navigator.geolocation.watchPosition(
				handleSuccess,
				handleError,
				options
			)
			setTracking(true)
			setPath([]) // Очищаем путь при новом трекинге
		}
	}

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			if (watchId.current !== null) {
				navigator.geolocation.clearWatch(watchId.current)
			}
		}
	}, [])

	return (
		<div style={{ width: '100%', height: '100vh' }}>
			<YMaps query={{ apikey: 'ваш-api-ключ', lang: 'ru_RU' }}>
				<Map
					instanceRef={mapRef}
					state={{ center: position, zoom: 16 }}
					width='100%'
					height='100%'
				>
					<Placemark
						geometry={position}
						options={{
							preset: 'islands#redCircleDotIcon',
							iconColor: tracking ? '#00FF00' : '#FF0000',
						}}
					/>
					{path.length > 1 && (
						<Polyline
							geometry={path}
							options={{
								strokeColor: '#1E90FF',
								strokeWidth: 4,
								strokeOpacity: 0.7,
							}}
						/>
					)}
				</Map>
			</YMaps>

			<button
				onClick={toggleTracking}
				style={{
					position: 'absolute',
					top: '20px',
					left: '20px',
					zIndex: 1000,
					padding: '10px 20px',
					background: tracking ? '#ff4444' : '#4CAF50',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer',
				}}
			>
				{tracking ? 'Остановить трекинг' : 'Начать трекинг'}
			</button>

			<div
				style={{
					position: 'absolute',
					bottom: '20px',
					left: '20px',
					zIndex: 1000,
					background: 'white',
					padding: '10px',
					borderRadius: '4px',
				}}
			>
				Текущие координаты: {position[0].toFixed(6)}, {position[1].toFixed(6)}
			</div>
		</div>
	)
}

export default TrackerMap
