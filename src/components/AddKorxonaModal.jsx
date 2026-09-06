import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Modal, Steps, Form, Input, Select, InputNumber, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { TASHLANMA_KATEGORIYALARI, BOSHQA_QIYMAT } from '../data/tashlanmaTurlari';
import { generateKorxonaId } from '../data/korxonalar';

const getFirstWordLowercase = (str) => {
  const filtered = str.replace(/[-',`ʻ]/g, '');
  return filtered.split(' ')[0].toLowerCase();
};

const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const ModalMapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
};

const ModalMapZoom = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
};

const resolveBoshqa = (field) => (entry) => {
  if (entry?.[field] === BOSHQA_QIYMAT) {
    const { boshqa_nomi, ...rest } = entry;
    return { ...rest, [field]: boshqa_nomi };
  }
  return entry;
};

// "Yangi korxona qo'shish" — 3 bosqichli modal: (1) asosiy ma'lumotlar,
// (2) 5 turdagi tashlanma (har biri bir nechta yozuvga ega bo'lishi mumkin),
// (3) viloyat/tuman tanlab, xaritada korxona hududini (poligon) chizish.
export default function AddKorxonaModal({ open, onClose, onSubmit, regionsGeoJson, regionsData, regionsList }) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [selectedViloyat, setSelectedViloyat] = useState(undefined);
  const [selectedTuman, setSelectedTuman] = useState(undefined);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapGeoJSON, setMapGeoJSON] = useState(null);
  const [huduPoints, setHuduPoints] = useState([]);

  const resetAll = () => {
    form.resetFields();
    setStep(0);
    setSelectedViloyat(undefined);
    setSelectedTuman(undefined);
    setMapBounds(null);
    setMapGeoJSON(null);
    setHuduPoints([]);
  };

  const handleCancel = () => {
    resetAll();
    onClose();
  };

  const handleViloyatChange = (value) => {
    setSelectedViloyat(value);
    setSelectedTuman(undefined);
    form.setFieldValue('tuman', undefined);
    setHuduPoints([]);

    const regionFeature = regionsGeoJson.features.find(
      (f) => getFirstWordLowercase(f.properties.name) === value
    );
    if (regionFeature) {
      const bounds = L.geoJSON(regionFeature).getBounds();
      setMapBounds(bounds);
      setMapGeoJSON({ type: 'FeatureCollection', features: [regionFeature] });
    } else {
      setMapBounds(null);
      setMapGeoJSON(null);
    }
  };

  const handleTumanChange = (value) => {
    setSelectedTuman(value);
    setHuduPoints([]);

    if (value && selectedViloyat && regionsData[selectedViloyat]) {
      const regionGeoJSON = regionsData[selectedViloyat].path;
      const districtFeature = regionGeoJSON.features.find(
        (f) => getFirstWordLowercase(f.properties.name) === value
      );
      if (districtFeature) {
        const bounds = L.geoJSON(districtFeature).getBounds();
        setMapBounds(bounds);
        setMapGeoJSON({ type: 'FeatureCollection', features: [districtFeature] });
      }
    }
  };

  const handleMapClickAddPoint = (latlng) => {
    setHuduPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
  };

  const getTumanlarList = () => {
    if (selectedViloyat && regionsData[selectedViloyat]?.subData) {
      return regionsData[selectedViloyat].subData.map((d) => d.name);
    }
    return [];
  };

  const goNext = async () => {
    try {
      if (step === 0) {
        await form.validateFields(['inn', 'nomi']);
      } else if (step === 1) {
        await form.validateFields(TASHLANMA_KATEGORIYALARI.map((c) => c.key));
      }
      setStep((s) => s + 1);
    } catch {
      // AntD allaqachon xatolikni maydon ostida ko'rsatadi
    }
  };

  const goPrev = () => setStep((s) => s - 1);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedViloyat || !selectedTuman) {
        message.error('Viloyat va tumanni tanlang');
        return;
      }
      if (huduPoints.length < 3) {
        message.error("Korxona hududini xaritada belgilang (kamida 3 ta nuqta)");
        return;
      }

      const korxona = {
        id: generateKorxonaId(),
        inn: values.inn,
        nomi: values.nomi,
        viloyat: selectedViloyat,
        tuman: selectedTuman,
        hudud: huduPoints,
        tashlanmalar: Object.fromEntries(
          TASHLANMA_KATEGORIYALARI.map((cat) => [
            cat.key,
            (values[cat.key] || []).map(resolveBoshqa(cat.optionsField)),
          ])
        ),
      };

      onSubmit(korxona);
      message.success("Korxona muvaffaqiyatli qo'shildi");
      resetAll();
      onClose();
    } catch {
      // validatsiya xatosi allaqachon ko'rsatilgan
    }
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#059669', borderBottom: '2px solid #059669', paddingBottom: '0.5rem' }}>
          Yangi korxona qo'shish
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={840}
      style={{ top: 20 }}
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', padding: '1rem' } }}
      destroyOnHidden
    >
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: '1.5rem' }}
        items={[
          { title: 'Asosiy ma\'lumotlar' },
          { title: 'Tashlanmalar' },
          { title: 'Joylashuv' },
        ]}
      />

      <Form form={form} layout="vertical">
        {/* 1-bosqich: Asosiy ma'lumotlar */}
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Form.Item
              name="inn"
              label="INN (STIR)"
              rules={[
                { required: true, message: 'INN kiriting!' },
                { pattern: /^\d{9,14}$/, message: 'INN 9-14 xonali raqamdan iborat bo\'lishi kerak' },
              ]}
            >
              <Input placeholder="Masalan: 305137061" />
            </Form.Item>
            <Form.Item
              name="nomi"
              label="Korxona nomi"
              rules={[{ required: true, message: 'Korxona nomini kiriting!' }]}
            >
              <Input placeholder="Korxona nomi" />
            </Form.Item>
          </div>
        </div>

        {/* 2-bosqich: Tashlanmalar */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          {TASHLANMA_KATEGORIYALARI.map((cat) => (
            <div
              key={cat.key}
              style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}
            >
              <h4 style={{ margin: '0 0 1rem', color: '#334155', fontSize: '0.95rem' }}>{cat.label}</h4>
              <Form.List name={cat.key}>
                {(fields, { add, remove }) => (
                  <div>
                    {fields.map((field) => (
                      <div key={field.key} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <Form.Item
                          {...field}
                          name={[field.name, cat.optionsField]}
                          label={cat.optionLabel}
                          rules={[{ required: true, message: 'Tanlang' }]}
                          style={{ flex: '2 1 220px', marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Tanlang"
                            showSearch
                            optionFilterProp="children"
                            options={[
                              ...cat.options.map((o) => ({ value: o, label: o })),
                              { value: BOSHQA_QIYMAT, label: "Boshqa (qo'lda kiritish)" },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            const currentVal = getFieldValue([cat.key, field.name, cat.optionsField]);
                            if (currentVal !== BOSHQA_QIYMAT) return null;
                            return (
                              <Form.Item
                                {...field}
                                name={[field.name, 'boshqa_nomi']}
                                label="Nomi (qo'lda)"
                                rules={[{ required: true, message: 'Nomini kiriting' }]}
                                style={{ flex: '2 1 220px', marginBottom: 0 }}
                              >
                                <Input placeholder="Nomini kiriting" />
                              </Form.Item>
                            );
                          }}
                        </Form.Item>

                        {cat.units.map((u) => (
                          <Form.Item
                            key={u.field}
                            {...field}
                            name={[field.name, u.field]}
                            label={u.label}
                            rules={[{ required: true, message: 'Kiriting' }]}
                            style={{ flex: '1 1 120px', marginBottom: 0 }}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                          </Form.Item>
                        ))}

                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          style={{ marginTop: '1.75rem' }}
                        />
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Qo'shish
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          ))}
        </div>

        {/* 3-bosqich: Joylashuv va hudud chizish */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Form.Item name="viloyat" label="Viloyat" rules={[{ required: true, message: 'Viloyatni tanlang!' }]}>
              <Select placeholder="Viloyatni tanlang" onChange={handleViloyatChange} showSearch optionFilterProp="children">
                {regionsList.map((region) => (
                  <Select.Option key={region} value={region}>
                    {formatName(region)} viloyati
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="tuman" label="Tuman/Shahar" rules={[{ required: true, message: 'Tumanni tanlang!' }]}>
              <Select
                placeholder={selectedViloyat ? 'Tumanni tanlang' : 'Avval viloyat tanlang'}
                disabled={!selectedViloyat}
                onChange={handleTumanChange}
                showSearch
                optionFilterProp="children"
              >
                {getTumanlarList().map((district) => (
                  <Select.Option key={district} value={district}>
                    {formatName(district)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Korxona hududini xaritada bosib belgilang (kamida 3 ta nuqta) — nuqtalar avtomatik yopiq hudud sifatida chiziladi.
          </label>

          <div style={{ height: '320px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0', position: 'relative' }}>
            {!selectedTuman ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8' }}>
                Avval viloyat va tumanni tanlang
              </div>
            ) : (
              <MapContainer center={[41.3812, 64.5736]} zoom={6} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                <ModalMapZoom bounds={mapBounds} />
                <ModalMapClickHandler onMapClick={handleMapClickAddPoint} />

                {mapGeoJSON && (
                  <GeoJSON
                    key={JSON.stringify(mapGeoJSON)}
                    data={mapGeoJSON}
                    style={{ weight: 2, opacity: 1, color: '#2563eb', fillOpacity: 0.05, fillColor: '#2563eb' }}
                  />
                )}

                {huduPoints.length >= 3 && (
                  <Polygon
                    positions={huduPoints}
                    pathOptions={{ color: '#ef4444', weight: 3, dashArray: '6 6', fillColor: '#ef4444', fillOpacity: 0.15 }}
                  />
                )}

                {huduPoints.map((p, idx) => (
                  <CircleMarker
                    key={idx}
                    center={p}
                    radius={5}
                    pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#fff', fillOpacity: 1 }}
                  />
                ))}
              </MapContainer>
            )}

            <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '0.5rem', zIndex: 1000 }}>
              <Button
                size="small"
                onClick={() => setHuduPoints((p) => p.slice(0, -1))}
                disabled={huduPoints.length === 0}
              >
                Oxirgi nuqtani o'chirish
              </Button>
              <Button
                size="small"
                onClick={() => setHuduPoints([])}
                disabled={huduPoints.length === 0}
              >
                Tozalash
              </Button>
              <span style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#334155', alignSelf: 'center' }}>
                Nuqtalar: {huduPoints.length}
              </span>
            </div>
          </div>
        </div>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '1.25rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={handleCancel}>Bekor qilish</Button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {step > 0 && <Button onClick={goPrev}>Ortga</Button>}
          {step < 2 ? (
            <Button type="primary" onClick={goNext} style={{ background: '#059669', borderColor: '#059669' }}>
              Keyingisi
            </Button>
          ) : (
            <Button type="primary" onClick={handleFinish} style={{ background: '#059669', borderColor: '#059669' }}>
              Saqlash
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
