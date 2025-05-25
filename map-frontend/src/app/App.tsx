import { useState, useEffect, useRef } from 'react'
import { YMaps, Map, Placemark, Polyline } from '@pbe/react-yandex-maps'

const TrackerMap = () => {
	const [position, setPosition] = useState([55.75, 37.57]) // Начальные координаты (Москва)
	const [tracking, setTracking] = useState(false)
	const [path, setPath] = useState([])
	const mapRef = useRef(null)
	const watchId = useRef(null)

	// Функция успешного получения геолокации
	const handleSuccess = pos => {
		const { latitude, longitude } = pos.coords
		const newPosition = [latitude, longitude]
		setPosition(newPosition)
		setPath(prev => [...prev, newPosition])
		console.log('123')
		// Автоматическое перемещение карты
		if (mapRef.current) {
			mapRef.current.setCenter(newPosition)
		}
	}

	// Функция обработки ошибок геолокации
	const handleError = err => {
		console.error(`Ошибка геолокации: ${err.message}`)
		alert('Не удалось получить ваше местоположение')
	}

	// Запуск/остановка отслеживания
	const toggleTracking = () => {
		if (tracking) {
			navigator.geolocation.clearWatch(watchId.current)
			setTracking(false)
		} else {
			const options = {
				enableHighAccuracy: true,
				maximumAge: 0,
				timeout: 5,
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
			if (watchId.current) {
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
