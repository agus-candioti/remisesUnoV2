import { useEffect, useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import styles from './ZonaMapEditor.module.css'

// Leaflet + leaflet-draw are loaded lazily to avoid SSR issues and ensure
// the global L is available before leaflet-draw attaches to it.
let leafletLoaded = false

async function loadLeaflet() {
  if (leafletLoaded) return
  // Dynamic imports so Vite can tree-shake and leaflet-draw finds L on window
  const L = (await import('leaflet')).default
  window.L = L
  await import('leaflet/dist/leaflet.css')
  await import('leaflet-draw')
  await import('leaflet-draw/dist/leaflet.draw.css')

  // Fix default marker icon paths broken by Vite bundling
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
  leafletLoaded = true
}

/**
 * @param {{ zona: import('../../repositories/interfaces/IZonasRepository').Zona, onSave: function, onClose: function }} props
 */
export default function ZonaMapEditor({ zona, onSave, onClose }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const drawnLayersRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let destroyed = false

    loadLeaflet().then(() => {
      if (destroyed || !containerRef.current) return

      const L = window.L

      // Prevent double-init if React re-renders
      if (containerRef.current._leaflet_id) return

      const map = L.map(containerRef.current).setView([-34.617, -58.443], 12)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Feature group that leaflet-draw manages
      const drawnLayers = new L.FeatureGroup()
      drawnLayersRef.current = drawnLayers
      map.addLayer(drawnLayers)

      // If the zone already has a polygon, render it
      if (zona.polygon && zona.polygon.length >= 3) {
        const latlngs = zona.polygon.map(p => [p.lat, p.lng])
        const poly = L.polygon(latlngs, { color: '#075E54', fillOpacity: 0.2 })
        drawnLayers.addLayer(poly)
        map.fitBounds(poly.getBounds(), { padding: [32, 32] })
      }

      // Draw control
      const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnLayers },
        draw: {
          polygon: { shapeOptions: { color: '#075E54', fillOpacity: 0.2 } },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
      })
      map.addControl(drawControl)

      // When a new polygon is drawn, clear previous and add the new one
      map.on(L.Draw.Event.CREATED, e => {
        drawnLayers.clearLayers()
        drawnLayers.addLayer(e.layer)
      })

      setReady(true)
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function extractPolygon() {
    const L = window.L
    if (!drawnLayersRef.current) return null
    const layers = drawnLayersRef.current.getLayers()
    if (layers.length === 0) return null
    const latlngs = layers[0].getLatLngs()[0]
    return latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }))
  }

  async function handleSave() {
    setSaving(true)
    const polygon = extractPolygon()
    await onSave(polygon)
    setSaving(false)
  }

  async function handleClear() {
    setSaving(true)
    await onSave(null)
    setSaving(false)
  }

  return (
    <Modal title={`Zona en mapa — ${zona.nombre}`} onClose={onClose} size="lg">
      <div className={styles.wrapper}>
        <p className={styles.hint}>
          Dibujá el polígono que define esta zona. El precio <strong>{
            new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(zona.precio)
          }</strong> se aplicará cuando el destino caiga dentro del área.
        </p>

        {!ready && <div className={styles.loading}>Cargando mapa…</div>}

        <div
          ref={containerRef}
          className={styles.map}
          style={{ visibility: ready ? 'visible' : 'hidden' }}
        />

        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleClear} disabled={saving}>
            Quitar zona del mapa
          </Button>
          <div className={styles.right}>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Guardar zona
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
