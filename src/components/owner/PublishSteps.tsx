import { Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TimeField } from '@/components/booking/TimeField';
import { MapView } from '@/components/map';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { featureCatalog, featureOrder, kindCatalog, kindOrder } from '@/constants/catalog';
import { palette, radius, space } from '@/constants/theme';
import { useListingDraftStore } from '@/store/useListingDraftStore';
import { formatCop, formatMinutes } from '@/utils/format';
import { BOGOTA_CENTER } from '@/utils/geo';
import { PhotoPickerGrid } from './PhotoPickerGrid';

const ZONES = ['Chapinero', 'Chicó', 'Zona T', 'Usaquén', 'Cedritos', 'Salitre', 'Teusaquillo'];
const PRICE_SUGGESTIONS = [3000, 4500, 6000, 8000];

/**
 * Referencias frecuentes en Bogotá, para no obligar a escribir lo obvio.
 * La lista es un atajo, no un límite: siempre se puede añadir otra.
 */
const NEARBY_SUGGESTIONS = [
  'Centro Comercial Andino',
  'Parque de la 93',
  'Zona T',
  'Universidad Javeriana',
  'Estación Calle 85',
  'Centro Comercial Unicentro',
  'Clínica del Country',
];

/** Step 1 — photos. */
export function PhotosStep() {
  const photos = useListingDraftStore((state) => state.draft.photos);
  const addPhoto = useListingDraftStore((state) => state.addPhoto);
  const removePhoto = useListingDraftStore((state) => state.removePhoto);

  return (
    <View style={styles.block}>
      <PhotoPickerGrid photos={photos} onAdd={addPhoto} onRemove={removePhoto} />
      <Text variant="footnote" color="inkTertiary">
        La primera foto será la portada. Muestra la entrada, el espacio y cómo se llega.
      </Text>
    </View>
  );
}

/** Step 2 — location. */
export function LocationStep() {
  const draft = useListingDraftStore((state) => state.draft);
  const setCoordinate = useListingDraftStore((state) => state.setCoordinate);
  const toggleLandmark = useListingDraftStore((state) => state.toggleLandmark);

  const [custom, setCustom] = useState('');

  // Hasta que se toque el mapa no hay punto elegido, pero el mapa tiene que
  // abrir en algún sitio. Bogotá centro es el arranque y el pin no se pinta.
  const point = draft.coordinate ?? BOGOTA_CENTER;

  const addCustom = () => {
    const value = custom.trim();
    if (value.length === 0) return;
    toggleLandmark(value);
    setCustom('');
  };

  return (
    <View style={styles.block}>
      <View style={styles.picker}>
        <MapView
          markers={[]}
          selectedId={null}
          onSelectMarker={() => {}}
          userLocation={point}
          focus={point}
          pin={draft.coordinate}
          // El punto azul aquí hablaría de dónde está el propietario, que no
          // es lo que se está eligiendo.
          showsUser={false}
          onPressCoordinate={(coordinate) =>
            setCoordinate(coordinate, draft.address, draft.zone)
          }
        />
      </View>
      <Text variant="footnote" color="inkTertiary">
        {draft.coordinate
          ? 'Toca el mapa para mover el punto hasta la entrada.'
          : 'Toca el mapa para marcar dónde queda la entrada.'}
      </Text>

      <Input
        label="Dirección"
        value={draft.address}
        onChangeText={(address) => setCoordinate(point, address, draft.zone)}
        placeholder="Carrera 15 # 85-32"
        autoCapitalize="words"
      />

      <View style={styles.group}>
        <Overline>Zona</Overline>
        <View style={styles.chips}>
          {ZONES.map((zone) => (
            <Chip
              key={zone}
              label={zone}
              selected={draft.zone === zone}
              onPress={() => setCoordinate(point, draft.address, zone)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Overline>Cerca de · opcional</Overline>
        <Text variant="footnote" color="inkTertiary">
          La mayoría de conductores ubica por referencia antes que por dirección.
          Añade hasta cuatro.
        </Text>

        <View style={styles.chips}>
          {/* Lo ya elegido va primero y se quita tocándolo. */}
          {draft.landmarks.map((landmark) => (
            <Chip
              key={landmark}
              label={landmark}
              selected
              onPress={() => toggleLandmark(landmark)}
            />
          ))}
          {NEARBY_SUGGESTIONS.filter(
            (suggestion) => !draft.landmarks.includes(suggestion),
          ).map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onPress={() => toggleLandmark(suggestion)}
            />
          ))}
        </View>

        <View style={styles.addRow}>
          <Input
            value={custom}
            onChangeText={setCustom}
            placeholder="Otra referencia"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={addCustom}
            containerStyle={styles.addInput}
          />
          <IconButton
            icon={Plus}
            tone="filled"
            onPress={addCustom}
            disabled={custom.trim().length === 0}
            accessibilityLabel="Agregar referencia"
          />
        </View>
      </View>
    </View>
  );
}

/** Step 3 — name, type, description. */
export function InfoStep() {
  const draft = useListingDraftStore((state) => state.draft);
  const setInfo = useListingDraftStore((state) => state.setInfo);

  return (
    <View style={styles.block}>
      <Input
        label="Nombre"
        value={draft.name}
        onChangeText={(name) => setInfo({ name })}
        placeholder="Garaje Calle 85"
        autoCapitalize="words"
      />

      <View style={styles.group}>
        <Overline>Tipo</Overline>
        <View style={styles.chips}>
          {kindOrder.map((kind) => (
            <Chip
              key={kind}
              label={kindCatalog[kind].label}
              icon={kindCatalog[kind].icon}
              selected={draft.kind === kind}
              onPress={() => setInfo({ kind })}
            />
          ))}
        </View>
      </View>

      <Input
        label="Descripción"
        value={draft.description}
        onChangeText={(description) => setInfo({ description })}
        placeholder="Cuenta cómo es el acceso, qué tan amplio es y qué lo hace cómodo."
        multiline
        numberOfLines={4}
        style={styles.multiline}
        hint="Dos o tres frases bastan."
      />
    </View>
  );
}

/** Step 4 — features. */
export function FeaturesStep() {
  const features = useListingDraftStore((state) => state.draft.features);
  const toggleFeature = useListingDraftStore((state) => state.toggleFeature);

  return (
    <View style={styles.block}>
      <View style={styles.chips}>
        {featureOrder.map((key) => (
          <Chip
            key={key}
            label={featureCatalog[key].label}
            icon={featureCatalog[key].icon}
            showCheck
            selected={features.includes(key)}
            onPress={() => toggleFeature(key)}
          />
        ))}
      </View>
      <Text variant="footnote" color="inkTertiary">
        Los conductores filtran por estas características.
      </Text>
    </View>
  );
}

/** Step 5 — price. */
export function PriceStep() {
  const draft = useListingDraftStore((state) => state.draft);
  const setPrice = useListingDraftStore((state) => state.setPrice);

  return (
    <View style={styles.block}>
      <Input
        label="Precio por hora"
        value={draft.pricePerHour != null ? String(draft.pricePerHour) : ''}
        onChangeText={(value) => setPrice(value ? Number(value.replace(/\D/g, '')) : null)}
        placeholder="4500"
        keyboardType="number-pad"
        suffix="COP"
      />

      <View style={styles.chips}>
        {PRICE_SUGGESTIONS.map((value) => (
          <Chip
            key={value}
            label={formatCop(value)}
            selected={draft.pricePerHour === value}
            onPress={() => setPrice(value)}
          />
        ))}
      </View>

      <Input
        label="Precio por día (opcional)"
        value={draft.pricePerDay != null ? String(draft.pricePerDay) : ''}
        onChangeText={(value) =>
          setPrice(draft.pricePerHour, value ? Number(value.replace(/\D/g, '')) : null)
        }
        placeholder="32000"
        keyboardType="number-pad"
        suffix="COP"
        hint="Si lo defines, se cobra el menor entre el total por horas y este valor."
      />
    </View>
  );
}

/** Step 6 — opening hours. */
export function HoursStep() {
  const hours = useListingDraftStore((state) => state.draft.hours);
  const setHours = useListingDraftStore((state) => state.setHours);

  const opensAt = hours[0]?.opensAt ?? 6 * 60;
  const closesAt = hours[0]?.closesAt ?? 22 * 60;

  const update = (next: { opensAt?: number; closesAt?: number }) => {
    setHours(hours.map((entry) => ({ ...entry, ...next })));
  };

  return (
    <View style={styles.block}>
      <View style={styles.times}>
        <View style={styles.timeField}>
          <TimeField label="Abre" value={opensAt} onChange={(value) => update({ opensAt: value })} />
        </View>
        <View style={styles.timeField}>
          <TimeField
            label="Cierra"
            value={closesAt}
            onChange={(value) => update({ closesAt: value })}
            min={opensAt + 60}
          />
        </View>
      </View>

      <Text variant="footnote" color="inkTertiary">
        Este horario aplica todos los días. Podrás ajustar días específicos desde la ficha del
        parqueadero.
      </Text>
    </View>
  );
}

/** Step 7 — capacity. */
export function CapacityStep() {
  const spots = useListingDraftStore((state) => state.draft.spotsTotal);
  const setSpots = useListingDraftStore((state) => state.setSpots);
  const value = spots ?? 1;

  return (
    <View style={styles.block}>
      <Surface elevation="hairline" style={styles.stepper}>
        <IconButton
          icon={Minus}
          tone="filled"
          onPress={() => setSpots(Math.max(1, value - 1))}
          disabled={value <= 1}
          accessibilityLabel="Quitar un cupo"
        />
        <View style={styles.stepperValue}>
          <Text variant="display">{value}</Text>
          <Text variant="footnote" color="inkTertiary">
            {value === 1 ? 'cupo' : 'cupos'}
          </Text>
        </View>
        <IconButton
          icon={Plus}
          tone="filled"
          onPress={() => setSpots(Math.min(400, value + 1))}
          accessibilityLabel="Agregar un cupo"
        />
      </Surface>

      <Text variant="footnote" color="inkTertiary">
        Cuántos vehículos pueden estar al mismo tiempo.
      </Text>
    </View>
  );
}

/** Step 8 — review. */
export function ReviewStep() {
  const draft = useListingDraftStore((state) => state.draft);

  return (
    <View style={styles.block}>
      <Surface elevation="hairline" style={styles.review}>
        <Text variant="title3">{draft.name || 'Sin nombre'}</Text>
        <Text variant="subhead" color="inkSecondary">
          {draft.address || 'Sin dirección'}
          {draft.zone ? ` · ${draft.zone}` : ''}
        </Text>
        {draft.landmarks.length > 0 ? (
          <Text variant="footnote" color="inkTertiary">
            Cerca de {draft.landmarks.join(' · ')}
          </Text>
        ) : null}

        <View style={styles.reviewLines}>
          <ReviewLine
            label="Tarifa"
            value={draft.pricePerHour != null ? `${formatCop(draft.pricePerHour)}/hora` : '—'}
          />
          <ReviewLine
            label="Horario"
            value={
              draft.hours[0]
                ? `${formatMinutes(draft.hours[0].opensAt)} – ${formatMinutes(draft.hours[0].closesAt)}`
                : '—'
            }
          />
          <ReviewLine label="Cupos" value={draft.spotsTotal != null ? String(draft.spotsTotal) : '—'} />
          <ReviewLine label="Fotos" value={String(draft.photos.length)} />
          <ReviewLine
            label="Características"
            value={draft.features.length > 0 ? String(draft.features.length) : 'Ninguna'}
          />
        </View>
      </Surface>

      <Text variant="footnote" color="inkTertiary">
        Revisaremos tu parqueadero antes de publicarlo. Suele tomar menos de 24 horas.
      </Text>
    </View>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewLine}>
      <Text variant="subhead" color="inkSecondary">
        {label}
      </Text>
      <Text variant="subhead">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: space.lg,
  },
  group: {
    gap: space.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  // El mapa se posiciona con absoluteFill, así que necesita un padre con alto.
  picker: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: palette.mapLand,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  addInput: {
    flex: 1,
  },
  times: {
    flexDirection: 'row',
    gap: space.md,
  },
  timeField: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.lg,
  },
  stepperValue: {
    alignItems: 'center',
  },
  review: {
    gap: space.sm,
    padding: space.lg,
    backgroundColor: palette.bg,
    borderRadius: radius.md,
  },
  reviewLines: {
    gap: space.sm,
    marginTop: space.sm,
  },
  reviewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
});
