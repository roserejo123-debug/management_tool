import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FiArrowLeft, FiMapPin, FiUpload } from 'react-icons/fi';
import { createProperty, fetchMyProperties, updateProperty } from '../../redux/slices/propertySlice';

const PROPERTY_TYPES = ['apartment', 'villa', 'house', 'plot', 'commercial', 'pg'];
const AMENITIES = [
  'parking', 'gym', 'swimming_pool', 'security', 'lift', 'power_backup',
  'garden', 'clubhouse', 'wifi', 'ac', 'furnished', 'semi_furnished',
  'pet_friendly', 'balcony',
];
const DEFAULT_CENTER = [20.5937, 78.9629];

const emptyForm = {
  title: '', description: '', type: 'apartment', listingType: 'sale',
  price: '', area: '', areaUnit: 'sqft', bedrooms: '0', bathrooms: '0',
  floors: '1', address: '', city: '', state: '', pincode: '', lat: '', lng: '',
  amenities: [],
};

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat.toFixed(6), lng: event.latlng.lng.toFixed(6) });
    },
  });

  return position ? <Marker position={position} /> : null;
}

const PropertyFormPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProperties, actionLoading } = useSelector((state) => state.properties);
  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [loadingProperty, setLoadingProperty] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return undefined;
    let active = true;

    dispatch(fetchMyProperties({ limit: 100 }))
      .unwrap()
      .then(({ properties }) => {
        if (!active) return;
        const property = properties.find((item) => item._id === id);
        if (!property) {
          setLoadError('This listing was not found in your properties.');
          return;
        }
        setForm({
          title: property.title || '',
          description: property.description || '',
          type: property.type || 'apartment',
          listingType: property.listingType || 'sale',
          price: property.price ?? '',
          area: property.area ?? '',
          areaUnit: property.areaUnit || 'sqft',
          bedrooms: property.bedrooms ?? 0,
          bathrooms: property.bathrooms ?? 0,
          floors: property.floors ?? 1,
          address: property.location?.address || '',
          city: property.location?.city || '',
          state: property.location?.state || '',
          pincode: property.location?.pincode || '',
          lat: property.location?.coordinates?.lat ?? '',
          lng: property.location?.coordinates?.lng ?? '',
          amenities: property.amenities || [],
        });
      })
      .catch((error) => {
        if (active) setLoadError(error || 'Unable to load this listing.');
      })
      .finally(() => {
        if (active) setLoadingProperty(false);
      });

    return () => { active = false; };
  }, [dispatch, id]);

  const previews = useMemo(
    () => newImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newImages]
  );

  useEffect(() => () => {
    previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  const position = useMemo(() => {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && form.lat !== '' && form.lng !== ''
      ? [lat, lng]
      : null;
  }, [form.lat, form.lng]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImagesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setFormError('');
    if (selected.some((file) => !file.type.startsWith('image/'))) {
      setFormError('Select image files only.');
      event.target.value = '';
      return;
    }
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) {
      setFormError('Each image must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }
    if (newImages.length + selected.length > 10) {
      setFormError('You can upload up to 10 images per property.');
      event.target.value = '';
      return;
    }
    setNewImages((current) => [...current, ...selected]);
    event.target.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (Number(form.price) < 0 || Number(form.area) <= 0) {
      setFormError('Enter a positive price and area.');
      return;
    }
    if ((form.lat === '') !== (form.lng === '')) {
      setFormError('Enter both map coordinates or leave both empty.');
      return;
    }
    if (position && (position[0] < -90 || position[0] > 90 || position[1] < -180 || position[1] > 180)) {
      setFormError('Map coordinates are outside the valid range.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, key === 'amenities' ? JSON.stringify(value) : value);
    });
    newImages.forEach((file) => formData.append('images', file));

    try {
      const result = id
        ? await dispatch(updateProperty({ id, formData })).unwrap()
        : await dispatch(createProperty(formData)).unwrap();
      navigate('/my-properties', { state: { message: result.message } });
    } catch (error) {
      setFormError(error || 'Unable to save this property.');
    }
  };

  if (loadingProperty) {
    return <div className="property-page-loading"><span className="spinner" /></div>;
  }

  if (loadError) {
    return (
      <main className="property-page">
        <div className="alert alert-error">{loadError}</div>
        <Link to="/my-properties" className="btn btn-outline">Back to My Properties</Link>
      </main>
    );
  }

  return (
    <main className="property-page">
      <Link to="/my-properties" className="property-back-link"><FiArrowLeft /> My Properties</Link>
      <header className="property-page-header">
        <p className="property-eyebrow">Property management</p>
        <h1>{id ? 'Edit your listing' : 'Create a property listing'}</h1>
        <p>Share accurate details to help buyers and renters find the right place.</p>
      </header>

      {formError && <div className="alert alert-error" role="alert">{formError}</div>}

      <form className="property-form card" onSubmit={handleSubmit}>
        <section className="property-form-section">
          <h2>Listing details</h2>
          <div className="property-form-grid">
            <label className="form-group property-form-span">
              <span className="form-label">Property title *</span>
              <input className="form-input" required maxLength="120" value={form.title} onChange={(e) => setField('title', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">Property type *</span>
              <select className="form-input" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
            </label>
            <label className="form-group">
              <span className="form-label">Listing type *</span>
              <select className="form-input" value={form.listingType} onChange={(e) => setField('listingType', e.target.value)}>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </label>
            <label className="form-group property-form-span">
              <span className="form-label">Description *</span>
              <textarea className="form-input property-textarea" required maxLength="2000" value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="property-form-section">
          <h2>Price and size</h2>
          <div className="property-form-grid">
            <label className="form-group">
              <span className="form-label">Price (₹) *</span>
              <input className="form-input" type="number" min="0" step="1" required value={form.price} onChange={(e) => setField('price', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">Area *</span>
              <input className="form-input" type="number" min="0.01" step="any" required value={form.area} onChange={(e) => setField('area', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">Area unit</span>
              <select className="form-input" value={form.areaUnit} onChange={(e) => setField('areaUnit', e.target.value)}>
                <option value="sqft">Square feet</option>
                <option value="sqm">Square metres</option>
                <option value="acres">Acres</option>
              </select>
            </label>
            {[
              ['bedrooms', 'Bedrooms'], ['bathrooms', 'Bathrooms'], ['floors', 'Floors'],
            ].map(([key, label]) => (
              <label className="form-group" key={key}>
                <span className="form-label">{label}</span>
                <input className="form-input" type="number" min="0" step="1" value={form[key]} onChange={(e) => setField(key, e.target.value)} />
              </label>
            ))}
          </div>
        </section>

        <section className="property-form-section">
          <h2>Location</h2>
          <div className="property-form-grid">
            <label className="form-group property-form-span">
              <span className="form-label">Street address *</span>
              <input className="form-input" required value={form.address} onChange={(e) => setField('address', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">City *</span>
              <input className="form-input" required value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">State *</span>
              <input className="form-input" required value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">Pincode</span>
              <input className="form-input" inputMode="numeric" value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} />
            </label>
          </div>
          <p className="property-map-help"><FiMapPin /> Click the map to set or update the property pin. This location appears on the listing detail page.</p>
          <div className="property-map-picker">
            <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 13 : 5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} onChange={({ lat, lng }) => setForm((current) => ({ ...current, lat, lng }))} />
            </MapContainer>
          </div>
          <div className="property-form-grid property-coordinate-grid">
            <label className="form-group">
              <span className="form-label">Latitude</span>
              <input className="form-input" type="number" min="-90" max="90" step="any" value={form.lat} onChange={(e) => setField('lat', e.target.value)} />
            </label>
            <label className="form-group">
              <span className="form-label">Longitude</span>
              <input className="form-input" type="number" min="-180" max="180" step="any" value={form.lng} onChange={(e) => setField('lng', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="property-form-section">
          <h2>Amenities</h2>
          <div className="property-amenities-grid">
            {AMENITIES.map((amenity) => (
              <label className="property-checkbox" key={amenity}>
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={(event) => setField(
                    'amenities',
                    event.target.checked
                      ? [...form.amenities, amenity]
                      : form.amenities.filter((item) => item !== amenity)
                  )}
                />
                <span>{amenity.replaceAll('_', ' ')}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="property-form-section">
          <h2>Property photos</h2>
          {id && (
            <div className="property-existing-images">
              {(myProperties.find((property) => property._id === id)?.images || []).map((image) => (
                <img key={image.public_id || image.url} src={image.url} alt="Existing property" />
              ))}
            </div>
          )}
          {previews.length > 0 && (
            <div className="property-existing-images">
              {previews.map(({ file, url }) => <img key={`${file.name}-${file.lastModified}`} src={url} alt={file.name} />)}
            </div>
          )}
          <label className="property-upload-control">
            <FiUpload />
            <span>Add photos (up to 10 images, 10 MB each)</span>
            <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
          </label>
        </section>

        <div className="property-form-actions">
          <Link to="/my-properties" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={actionLoading}>
            {actionLoading ? 'Saving…' : id ? 'Save Changes' : 'Create Listing'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default PropertyFormPage;
