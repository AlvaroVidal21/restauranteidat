import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Reservar = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [platos, setPlatos] = useState([]);
    const [experiencias, setExperiencias] = useState([]);
    const [mesasDisponibles, setMesasDisponibles] = useState([]);
    const [zonaFiltro, setZonaFiltro] = useState('');
    const [personaTipo, setPersonaTipo] = useState('pareja'); // solitario | pareja | familiar
    const [familiarCount, setFamiliarCount] = useState(3);
    const [user, setUser] = useState(null);
    const [clientesList, setClientesList] = useState([]);
    const [showAllDrinks, setShowAllDrinks] = useState(false);
    const [opcionalesFiltro, setOpcionalesFiltro] = useState('todo');

    const [formData, setFormData] = useState({
        plato_id: null,
        experiencia_id: null,
        fechareserva: '',
        horainicio: '',
        horafin: '',
        mesa: '',
        cliente: '',
        cantidadpersonas: 2,
        motivo: 'Experiencia Gastronómica',
        selectedItemName: '',
        selectedItemPrice: 0,
        notas: '',
        drink_id: null,
        drinkName: '',
        opcionales: [],
        opcionalesNombres: []
    });

    const timeSlots = [
        { label: '2:00 PM', value: '14:00' },
        { label: '4:00 PM', value: '16:00' },
        { label: '6:00 PM', value: '18:00' },
        { label: '8:00 PM', value: '20:00' },
    ];

    // Small inline icons to differentiate persona presets
    const PersonSoloIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" />
            <path d="M5 21c1.5-3.2 4-5 7-5s5.5 1.8 7 5" />
        </svg>
    );

    const CoupleIcon = () => (
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="9" r="4" />
            <circle cx="22" cy="9" r="4" />
            <path d="M4 26c1.2-4 3.8-6 6-6s4.8 2 6 6" />
            <path d="M16 26c1.2-4 3.8-6 6-6s4.8 2 6 6" />
        </svg>
    );

    const FamilyIcon = () => (
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="10" r="3.5" />
            <circle cx="23" cy="10" r="3.5" />
            <path d="M2.5 26c1.1-4 3.4-6 6.5-6s5.4 2 6.5 6" />
            <path d="M16.5 26c1.1-4 3.4-6 6.5-6s5.4 2 6.5 6" />
            <path d="M12 16.5h8" />
        </svg>
    );

    const personaOptions = [
        { key: 'solitario', label: 'Solitario', hint: '1 persona', Icon: PersonSoloIcon },
        { key: 'pareja', label: 'Pareja', hint: '2 personas', Icon: CoupleIcon },
        { key: 'familiar', label: 'Familiar', hint: '3 a 12', Icon: FamilyIcon }
    ];

    // Derive bebidas/tragos para mostrar opciones claras
    const drinksList = platos.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const name = (p.nombreplato || '').toLowerCase();
        return (
            cat.includes('bebi') ||
            cat.includes('trago') ||
            cat.includes('vino') ||
            cat.includes('coctel') ||
            cat.includes('drink') ||
            cat.includes('licor') ||
            cat.includes('whis') ||
            name.includes('vino') ||
            name.includes('trago') ||
            name.includes('cocktail')
        );
    });

    const displayDrinks = drinksList.length > 0 ? drinksList : (showAllDrinks ? platos : []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Inicia Sesión',
                text: 'Debes estar registrado para reservar.',
                confirmButtonText: 'Ir al Login'
            }).then(() => navigate('/login'));
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData(prev => ({ ...prev, cliente: parsedUser.dni === 'admin' ? '' : parsedUser.idcliente }));

        if (parsedUser.dni === 'admin') {
            fetch('http://127.0.0.1:8000/api/clientes')
                .then(res => res.json())
                .then(data => setClientesList(data))
                .catch(err => console.error("Error loading clients", err));
        }

        fetch('http://127.0.0.1:8000/api/listarplatos')
            .then(res => res.json())
            .then(data => setPlatos(data));

        fetch('http://127.0.0.1:8000/api/experiencias')
            .then(res => res.json())
            .then(data => setExperiencias(data));
    }, [navigate]);

    const clean = (text) => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '');

    const handleSelectExperience = (exp) => {
        const isRomantic = clean(exp.nombre).includes('romant');
        setPersonaTipo(prev => (isRomantic ? 'pareja' : prev));
        setFormData(prev => ({
            ...prev,
            experiencia_id: exp.idexperiencia,
            selectedItemName: exp.nombre,
            selectedItemPrice: exp.precio,
            cantidadpersonas: isRomantic ? 2 : prev.cantidadpersonas
        }));
    };

    const handleSelectDrink = (drink) => {
        setFormData(prev => ({
            ...prev,
            drink_id: drink.idplato,
            drinkName: drink.nombreplato
        }));
    };

    const toggleOpcional = (plato) => {
        setFormData(prev => {
            const exists = prev.opcionales.includes(plato.idplato);
            const nextOpcionales = exists
                ? prev.opcionales.filter(id => id !== plato.idplato)
                : [...prev.opcionales, plato.idplato];

            const nextNombres = exists
                ? prev.opcionalesNombres.filter(name => name !== plato.nombreplato)
                : [...prev.opcionalesNombres, plato.nombreplato];

            return {
                ...prev,
                opcionales: nextOpcionales,
                opcionalesNombres: nextNombres
            };
        });
    };

    // Keep formData.cantidadpersonas in sync with personaTipo/familiarCount
    useEffect(() => {
        if (personaTipo === 'solitario') {
            setFormData(prev => ({ ...prev, cantidadpersonas: 1 }));
        } else if (personaTipo === 'pareja') {
            setFormData(prev => ({ ...prev, cantidadpersonas: 2 }));
        } else {
            setFormData(prev => ({ ...prev, cantidadpersonas: familiarCount }));
        }
    }, [personaTipo, familiarCount]);

    const isRomanticSelected = clean(formData.selectedItemName).includes('romant');

    const checkAvailability = async (e) => {
        e.preventDefault();
        if (!formData.fechareserva || !formData.horainicio) {
            Swal.fire('Error', 'Seleccione fecha y hora', 'error');
            return;
        }

        const [hours, minutes] = formData.horainicio.split(':');
        const endHours = parseInt(hours, 10) + 2;
        const horafin = `${endHours.toString().padStart(2, '0')}:${minutes}`;
        setFormData(prev => ({ ...prev, horafin }));

        try {
            const response = await fetch('http://127.0.0.1:8000/api/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: formData.fechareserva,
                    hora: formData.horainicio,
                    cantidadpersonas: Number(formData.cantidadpersonas),
                    experiencia_id: formData.experiencia_id,
                    zona: zonaFiltro || null
                })
            });
            const data = await response.json();
            setMesasDisponibles(data);
            if (data.length > 0) {
                setStep(4);
            } else {
                Swal.fire('Lo sentimos', 'No hay mesas disponibles para ese horario.', 'warning');
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo consultar disponibilidad', 'error');
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        if (user?.dni === 'admin') {
            const adminOwnId = user.idcliente;
            if (!formData.cliente) {
                Swal.fire('Seleccione cliente', 'El administrador debe reservar para un cliente registrado.', 'warning');
                return;
            }
            if (String(formData.cliente) === String(adminOwnId)) {
                Swal.fire('Cliente inválido', 'No puede reservarse a sí mismo; seleccione un cliente registrado.', 'warning');
                return;
            }
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const clienteNombre = user?.dni === 'admin'
                    ? (clientesList.find(c => String(c.idcliente) === String(formData.cliente))?.nombres || 'cliente seleccionado')
                    : user?.nombres;

                Swal.fire({
                    icon: 'success',
                    title: 'Reserva Confirmada',
                    text: `Reserva creada para ${clienteNombre}.`,
                }).then(() => navigate('/'));
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Error al reservar', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    };

    // Step indicator
    const StepIndicator = () => (
        <div className="stepper">
            {[1, 2, 3, 4].map(num => (
                <div key={num} className="stepper-item">
                    <div className={`stepper-dot ${step >= num ? 'is-active' : ''}`}>{num}</div>
                    <span className="stepper-label">
                        {num === 1 && 'Selección'}
                        {num === 2 && 'Opcionales'}
                        {num === 3 && 'Fecha'}
                        {num === 4 && 'Confirmar'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="lab-container">
            <div className="lab-card booking-card">

                {/* Header */}
                <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p className="menu-meta">Reservas</p>
                    <h2>
                        {step === 1 && 'Selecciona experiencia y una bebida'}
                        {step === 2 && 'Agrega platos opcionales (o salta)'}
                        {step === 3 && 'Elige fecha y turno'}
                        {step === 4 && 'Confirma tu reserva'}
                    </h2>
                    <div className="gold-line"></div>
                </div>

                <StepIndicator />

                {/* STEP 1: Selección principal */}
                {step === 1 && (
                    <div className="selection-shell">
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem' }}>Experiencias Exclusivas</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>Elige tu experiencia base. La tarjeta seleccionada se ilumina.</p>
                        <div className="selection-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {experiencias.map(exp => {
                                const isSelected = formData.experiencia_id === exp.idexperiencia;
                                return (
                                    <div
                                        key={exp.idexperiencia}
                                        className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                        style={{ cursor: 'pointer', padding: 'var(--spacing-md)', position: 'relative' }}
                                        onClick={() => handleSelectExperience(exp)}
                                    >
                                        <p className="menu-meta">Experiencia</p>
                                        <h4 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.3rem' }}>{exp.nombre}</h4>
                                        <p className="text-muted" style={{ fontSize: '13px', marginBottom: 'var(--spacing-sm)' }}>{exp.descripcion}</p>
                                        <span className="menu-price">${parseFloat(exp.precio).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem' }}>Elige tu bebida</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>Selecciona la bebida que acompañará tu experiencia.</p>
                        {displayDrinks.length === 0 && (
                            <div className="empty-state" style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                                <p className="text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>No se detectaron tragos por categoría.</p>
                                <div className="actions-inline" style={{ gap: 'var(--spacing-sm)' }}>
                                    <button className="btn-lab" type="button" onClick={() => setShowAllDrinks(true)}>Mostrar toda la carta para elegir</button>
                                    <button className="btn-lab btn-lab-primary" type="button" onClick={() => setStep(2)} disabled={!formData.experiencia_id}>Continuar sin trago</button>
                                </div>
                            </div>
                        )}
                        <div className="selection-grid">
                            {displayDrinks.map(drink => {
                                const isSelected = formData.drink_id === drink.idplato;
                                return (
                                    <div
                                        key={drink.idplato}
                                        className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                        style={{ cursor: 'pointer', padding: 'var(--spacing-md)', position: 'relative' }}
                                        onClick={() => handleSelectDrink(drink)}
                                    >
                                        <p className="menu-meta">Bebida</p>
                                        <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{drink.nombreplato}</h4>
                                        <p style={{ fontSize: '12px', color: 'var(--color-gold)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {drink.categoria || 'Bebida'}</p>
                                        <p className="text-muted" style={{ fontSize: '12px', minHeight: '32px' }}>{drink.descripcion || 'Maridaje sugerido para la experiencia.'}</p>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                                            ${parseFloat(drink.precio).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button
                                className="btn-lab btn-lab-primary"
                                disabled={!formData.experiencia_id || (displayDrinks.length > 0 && !formData.drink_id)}
                                onClick={() => setStep(2)}
                            >
                                Continuar a opcionales
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Platos opcionales */}
                {step === 2 && (
                    <div className="selection-shell">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Platos opcionales</h3>
                            <span className="text-muted" style={{ fontSize: '12px' }}>Puedes omitirlos y decidir al llegar</span>
                        </div>

                        <div className="tab-row" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {['todo', 'entradas', 'fondos', 'postres'].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`pill-tab ${opcionalesFiltro === cat ? 'pill-tab-active' : ''}`}
                                    onClick={() => setOpcionalesFiltro(cat)}
                                >
                                    {cat === 'todo' ? 'Todo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="selection-grid">
                            {platos
                                .filter(p => {
                                    const cat = (p.categoria || '').toLowerCase();
                                    const esBebida = cat.includes('bebi') || cat.includes('trago');
                                    if (esBebida) return false;
                                    if (opcionalesFiltro === 'todo') return true;
                                    return cat.includes(opcionalesFiltro);
                                })
                                .map(plato => {
                                    const isSelected = formData.opcionales.includes(plato.idplato);
                                    return (
                                        <div
                                            key={plato.idplato}
                                            className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                            style={{ cursor: 'pointer', padding: 'var(--spacing-md)', position: 'relative' }}
                                            onClick={() => toggleOpcional(plato)}
                                        >
                                            <h4 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.15rem' }}>{plato.nombreplato}</h4>
                                            <p style={{ fontSize: '12px', color: 'var(--color-gold)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {plato.categoria || 'Categoría'}
                                            </p>
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                                                ${parseFloat(plato.precio).toFixed(2)}
                                            </span>
                                            {isSelected && <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-gold)', fontWeight: '600' }}>✓</div>}
                                        </div>
                                    );
                                })}
                        </div>

                        {formData.opcionalesNombres.length > 0 && (
                            <div className="pill-row" style={{ marginTop: 'var(--spacing-md)' }}>
                                {formData.opcionalesNombres.map(name => (
                                    <span key={name} className="pill" style={{ background: 'var(--color-bg-soft)' }}>{name}</span>
                                ))}
                            </div>
                        )}

                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn-lab" onClick={() => setStep(1)}>Atrás</button>
                            <button className="btn-lab btn-lab-primary" onClick={() => setStep(3)}>Continuar</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Fecha y hora */}
                {step === 3 && (
                    <form onSubmit={checkAvailability} className="form-shell" style={{ maxWidth: '540px', margin: '0 auto' }}>
                        <div className="summary-box">
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Selección</p>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0, color: 'var(--color-primary)' }}>{formData.selectedItemName || 'Selecciona una experiencia'}</p>
                            <p style={{ color: 'var(--color-gold)', margin: 0, fontWeight: '600' }}>{formData.drinkName ? `Bebida: ${formData.drinkName}` : 'Sin bebida seleccionada'}</p>
                            <p style={{ color: 'var(--color-text-muted)', margin: '4px 0' }}>Platos opcionales: {formData.opcionalesNombres.length || '0'}</p>
                            {formData.opcionalesNombres.length > 0 && (
                                <p style={{ color: 'var(--color-text)', margin: 0, fontSize: '12px' }}>{formData.opcionalesNombres.join(', ')}</p>
                            )}
                            <p style={{ color: 'var(--color-gold)', margin: '4px 0 0 0' }}>${parseFloat(formData.selectedItemPrice || 0).toFixed(2)} por persona</p>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Fecha de Reserva</label>
                            <input type="date" className="lab-input" required value={formData.fechareserva} onChange={e => setFormData({ ...formData, fechareserva: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Hora de Inicio (turnos de 2h)</label>
                            <select
                                className="lab-input"
                                required
                                value={formData.horainicio}
                                onChange={e => setFormData({ ...formData, horainicio: e.target.value })}
                            >
                                <option value="">-- Seleccione horario --</option>
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label>Personas</label>
                            {isRomanticSelected && (
                                <p style={{ margin: '4px 0 0 0', color: 'var(--color-gold)', fontSize: '12px', fontWeight: 600 }}>
                                    Cena romántica: fijo en 2 personas.
                                </p>
                            )}
                            <div
                                className="pill-row"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    rowGap: '18px',
                                    columnGap: '18px',
                                    marginTop: '18px'
                                }}
                            >
                                {personaOptions.map(opt => {
                                    const Icon = opt.Icon;
                                    const disabled = isRomanticSelected && opt.key !== 'pareja';
                                    const active = personaTipo === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            className={`pill-tab ${active ? 'pill-tab-active' : ''}`}
                                            onClick={() => {
                                                if (disabled) return;
                                                setPersonaTipo(opt.key);
                                            }}
                                            disabled={disabled}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                minWidth: '210px',
                                                justifyContent: 'flex-start',
                                                padding: '18px 18px',
                                                borderRadius: '14px',
                                                border: active ? '1px solid #d6b15c' : '1px solid #ebe6dc',
                                                background: active
                                                    ? 'linear-gradient(135deg, #fffaf1, #f7f1e6)'
                                                    : '#ffffff',
                                                color: '#1b1e28',
                                                boxShadow: active
                                                    ? '0 20px 38px rgba(0,0,0,0.08), 0 0 0 1px rgba(214,177,92,0.35)'
                                                    : '0 12px 28px rgba(0,0,0,0.07)',
                                                opacity: disabled ? 0.5 : 1,
                                                cursor: disabled ? 'not-allowed' : 'pointer',
                                                transition: 'transform 0.12s ease, box-shadow 0.15s ease, border-color 0.2s ease, background 0.25s ease'
                                            }}
                                            title={disabled ? 'Fijado en 2 personas para cena romántica' : ''}
                                            onMouseEnter={(e) => {
                                                if (disabled) return;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <Icon />
                                            <span style={{ textAlign: 'left', lineHeight: 1.25 }}>
                                                <div style={{ fontWeight: 700, letterSpacing: '0.2px', fontSize: '14px' }}>{opt.label}</div>
                                                <div style={{ fontSize: '11px', color: '#5a6175' }}>{opt.hint}</div>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {personaTipo === 'familiar' && !isRomanticSelected && (
                                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                    <label style={{ fontSize: '12px' }}>Número de personas (máx 12)</label>
                                    <input
                                        type="number"
                                        className="lab-input"
                                        min="3"
                                        max="12"
                                        value={familiarCount}
                                        onChange={e => setFamiliarCount(Math.min(12, Math.max(3, Number(e.target.value) || 3)))}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="actions-inline">
                            <button type="button" className="btn-lab" onClick={() => setStep(2)}>Atrás</button>
                            <button type="submit" className="btn-lab btn-lab-primary">Buscar Mesa</button>
                        </div>
                    </form>
                )}

                {/* STEP 4: Confirmación */}
                {step === 4 && (
                    <div className="form-shell" style={{ maxWidth: '540px', margin: '0 auto' }}>
                        <div className="summary-box">
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Resumen de Reserva</h4>

                            {user?.dni === 'admin' && (
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <label>Reservar para Cliente</label>
                                    <select
                                        className="lab-input"
                                        value={formData.cliente}
                                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {clientesList.map(c => (
                                            <option key={c.idcliente} value={c.idcliente}>{c.nombres} ({c.dni})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Experiencia</span>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formData.selectedItemName}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bebida</span>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formData.drinkName}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Platos opcionales</span>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formData.opcionalesNombres.length > 0 ? formData.opcionalesNombres.join(', ') : 'Ninguno'}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Fecha y Hora</span>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formData.fechareserva} a las {formData.horainicio}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Personas</span>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formData.cantidadpersonas}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Estimado</span>
                                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-gold)' }}>
                                        ${(parseFloat(formData.selectedItemPrice) * formData.cantidadpersonas).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label>Seleccione Mesa</label>
                            {mesasDisponibles.length === 0 && (
                                <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>No hay mesas disponibles para este turno.</p>
                            )}

                            {mesasDisponibles.length > 0 && (
                                <div style={{ margin: '8px 0 var(--spacing-sm) 0' }}>
                                    <label style={{ fontSize: '12px', marginRight: '8px' }}>Filtrar por zona</label>
                                    <select
                                        className="lab-input"
                                        value={zonaFiltro}
                                        onChange={e => setZonaFiltro(e.target.value)}
                                        style={{ maxWidth: '240px', display: 'inline-block' }}
                                    >
                                        <option value="">Todas</option>
                                        {[...new Set(mesasDisponibles.map(m => (m.zona || m.ubicacionmesa || '').toLowerCase()))]
                                            .filter(z => z)
                                            .map(z => (
                                                <option key={z} value={z}>{z}</option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="selection-grid">
                                {mesasDisponibles
                                    .filter(m => !zonaFiltro || (m.zona || m.ubicacionmesa || '').toLowerCase() === zonaFiltro)
                                    .map(mesa => {
                                        const isSelected = String(formData.mesa) === String(mesa.idmesa);
                                        const isReserved = Boolean(mesa.reservada);
                                        const disabledStyle = isReserved ? { opacity: 0.45, pointerEvents: 'none', border: '1px dashed var(--color-border)' } : {};
                                        return (
                                            <div
                                                key={mesa.idmesa}
                                                className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                                style={{ cursor: isReserved ? 'not-allowed' : 'pointer', padding: 'var(--spacing-md)', ...disabledStyle }}
                                                onClick={() => {
                                                    if (isReserved) return;
                                                    setFormData({ ...formData, mesa: mesa.idmesa });
                                                }}
                                            >
                                                <p className="menu-meta">Mesa {mesa.codigoinventario || mesa.nombremessa}</p>
                                                <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{mesa.nombremessa}</h4>
                                                <p className="text-muted" style={{ margin: 0 }}>{mesa.zona || mesa.ubicacionmesa}</p>
                                                <p style={{ margin: '4px 0', fontWeight: '600' }}>{(mesa.sillas || mesa.cantidadsillas)} sillas</p>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span className="pill" style={{ background: 'var(--color-bg-soft)', textTransform: 'capitalize' }}>{mesa.tipo || 'general'}</span>
                                                    {isReserved && <span className="pill" style={{ background: '#ffe3e3', color: '#c0392b' }}>Reservada</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="actions-inline">
                            <button className="btn-lab" onClick={() => setStep(3)}>Atrás</button>
                            <button className="btn-lab btn-lab-primary" onClick={handleSubmit} disabled={!formData.mesa || (user?.dni === 'admin' && !formData.cliente)}>
                                Confirmar Reserva
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservar;
