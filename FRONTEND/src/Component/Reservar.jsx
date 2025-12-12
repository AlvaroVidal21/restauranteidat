import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const Reservar = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
        experiencia_id: null,
        fechareserva: '',
        horainicio: '',
        horafin: '',
        mesa_id: '',
        cliente_id: '',
        cantidadpersonas: 2,
        motivo: 'Experiencia Gastronómica',
        selectedItemName: '',
        selectedItemPrice: 0,
        notas: '',
        // Detalles Consumo
        drink_id: null,
        drinkName: '',
        opcionales: [], // IDs
        opcionalesNombres: [] // Names
    });
    const [preselectedExpId, setPreselectedExpId] = useState(null);
    const [preselectApplied, setPreselectApplied] = useState(false);

    const timeSlots = [
        { label: '2:00 PM', value: '14:00' },
        { label: '4:00 PM', value: '16:00' },
        { label: '6:00 PM', value: '18:00' },
        { label: '8:00 PM', value: '20:00' },
    ];

    // Icons
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

    // Derive bebidas
    const drinksList = platos.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const name = (p.nombre || '').toLowerCase();
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
        // Correctly set cliente_id, assuming user.id is correct. If old user object has idcliente, use that.
        setFormData(prev => ({ ...prev, cliente_id: parsedUser.dni === 'admin' ? '' : (parsedUser.id || parsedUser.idcliente) }));

        if (parsedUser.dni === 'admin' || parsedUser.id === 1) {
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
            .then(data => setExperiencias(Array.isArray(data) ? data : []))
            .catch(() => setExperiencias([]));
    }, [navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search || '');
        const fromQuery = params.get('exp');
        const fromState = location.state && location.state.expId ? location.state.expId : null;
        const chosen = fromState || fromQuery;
        if (chosen) {
            setPreselectedExpId(String(chosen));
        }
    }, [location]);

    useEffect(() => {
        if (!preselectedExpId || preselectApplied || experiencias.length === 0) return;
        const match = experiencias.find(exp => String(exp.id || exp.idexperiencia) === String(preselectedExpId));
        if (match) {
            handleSelectExperience(match);
            setPreselectApplied(true);
        }
    }, [preselectedExpId, preselectApplied, experiencias]);

    const clean = (text) => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '');

    const handleSelectExperience = (exp) => {
        const isRomantic = clean(exp.nombre).includes('romant');
        setPersonaTipo(prev => (isRomantic ? 'pareja' : prev));
        setFormData(prev => ({
            ...prev,
            experiencia_id: exp.id || exp.idexperiencia,
            selectedItemName: exp.nombre,
            selectedItemPrice: exp.precio,
            cantidadpersonas: isRomantic ? 2 : prev.cantidadpersonas
        }));
    };

    const handleSelectDrink = (drink) => {
        setFormData(prev => ({
            ...prev,
            drink_id: drink.id || drink.idplato,
            drinkName: drink.nombre || drink.nombreplato
        }));
    };

    const toggleOpcional = (plato) => {
        const id = plato.id || plato.idplato;
        const nombre = plato.nombre || plato.nombreplato;

        setFormData(prev => {
            const exists = prev.opcionales.includes(id);
            const nextOpcionales = exists
                ? prev.opcionales.filter(pid => pid !== id)
                : [...prev.opcionales, id];

            const nextNombres = exists
                ? prev.opcionalesNombres.filter(name => name !== nombre)
                : [...prev.opcionalesNombres, nombre];

            return {
                ...prev,
                opcionales: nextOpcionales,
                opcionalesNombres: nextNombres
            };
        });
    };

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
                    cantidad_personas: Number(formData.cantidadpersonas)
                })
            });
            const data = await response.json();

            // Backend returns array of Mesas.
            // Filter locally by zona if needed, though availability logic should be done.
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
        if (!formData.mesa_id) {
            Swal.fire('Selecciona una mesa', 'Debes elegir una mesa antes de confirmar.', 'warning');
            return;
        }

        let finalClienteId = formData.cliente_id;

        if (user?.dni === 'admin') {
            if (!formData.cliente_id) {
                Swal.fire('Seleccione cliente', 'El administrador debe reservar para un cliente registrado.', 'warning');
                return;
            }
        }

        const detalles = {
            drink_id: formData.drink_id,
            drink_name: formData.drinkName,
            opcionales: formData.opcionales,
            opcionales_nombres: formData.opcionalesNombres,
            experiencia: formData.selectedItemName,
            precio_unitario: formData.selectedItemPrice
        };

        const payload = {
            cliente_id: finalClienteId,
            mesa_id: formData.mesa_id,
            fecha: formData.fechareserva,
            hora_inicio: formData.horainicio,
            hora_fin: formData.horafin,
            cantidad_personas: formData.cantidadpersonas,
            motivo: formData.motivo,
            detalles_consumo: detalles,
            total: (parseFloat(formData.selectedItemPrice) * formData.cantidadpersonas)
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const clienteNombre = user?.dni === 'admin'
                    ? (clientesList.find(c => String(c.id || c.idcliente) === String(formData.cliente_id))?.nombres || 'cliente')
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
                <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p className="menu-meta">Reservas</p>
                    <h2>
                        {step === 1 && 'Selecciona experiencia y una bebida'}
                        {step === 2 && 'Agrega platos opcionales'}
                        {step === 3 && 'Elige fecha y turno'}
                        {step === 4 && 'Confirma tu reserva'}
                    </h2>
                    <div className="gold-line"></div>
                </div>

                <StepIndicator />

                {/* STEP 1: Experience & Drink Logic Simplified for user clarity */}
                {step === 1 && (
                    <div className="selection-shell">
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem' }}>1. Elige tu Experiencia</h3>
                        <div className="selection-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {experiencias.map(exp => {
                                const expId = exp.id; // Use id directly
                                const isSelected = Number(formData.experiencia_id) === Number(expId);
                                return (
                                    <div
                                        key={expId}
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

                        {/* Optional Drink Selection in Step 1 or moving to Step 2? 
                            Keeping flow simple: Exp -> drink -> extras -> date
                         */}
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem', marginTop: 'var(--spacing-lg)' }}>2. Elige una bebida de cortesía/inicio</h3>
                        <div className="selection-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {displayDrinks.map(drink => {
                                const drinkId = drink.id;
                                const isSelected = Number(formData.drink_id) === Number(drinkId);
                                return (
                                    <div
                                        key={drinkId}
                                        className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                        onClick={() => handleSelectDrink(drink)}
                                    >
                                        <h4>{drink.nombre}</h4>
                                        <p style={{ fontSize: '12px' }}>{drink.descripcion}</p>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-xl)', justifyContent: 'center' }}>
                            <button className="btn-lab btn-lab-primary" style={{ padding: '12px 40px', fontSize: '1.1rem' }} onClick={() => {
                                if (!formData.experiencia_id) { Swal.fire('Atención', 'Selecciona una experiencia', 'warning'); return; }
                                // Drink is optional or required? Let's say optional, but encourage it.
                                setStep(2);
                            }}>
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Opcionales */}
                {step === 2 && (
                    <div className="selection-shell">
                        <h3 style={{ fontSize: '1.25rem' }}>Platos opcionales (Adicionales)</h3>
                        <div className="tab-row" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {['todo', 'entradas', 'fondos', 'postres'].map(cat => (
                                <button key={cat} type="button" className={`pill-tab ${opcionalesFiltro === cat ? 'pill-tab-active' : ''}`} onClick={() => setOpcionalesFiltro(cat)}>
                                    {cat === 'todo' ? 'Todo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="selection-grid">
                            {platos
                                .filter(p => {
                                    const cat = (p.categoria || '').toLowerCase();
                                    if (cat.includes('bebi') || cat.includes('trago')) return false; // Hide drinks here
                                    if (opcionalesFiltro === 'todo') return true;
                                    return cat.includes(opcionalesFiltro);
                                })
                                .map(plato => {
                                    const id = plato.id;
                                    const isSelected = formData.opcionales.includes(id);
                                    return (
                                        <div key={id} className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`} onClick={() => toggleOpcional(plato)}>
                                            <h4>{plato.nombre}</h4>
                                            <span style={{ color: 'var(--color-primary)' }}>${parseFloat(plato.precio).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn-lab" onClick={() => setStep(1)}>Atrás</button>
                            <button className="btn-lab btn-lab-primary" onClick={() => setStep(3)}>Continuar</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Fecha */}
                {step === 3 && (
                    <form onSubmit={checkAvailability} className="form-shell" style={{ maxWidth: '540px', margin: '0 auto' }}>
                        <div className="summary-box">
                            <p>Experiencia: <strong>{formData.selectedItemName}</strong></p>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Fecha de Reserva</label>
                            <input type="date" className="lab-input" required value={formData.fechareserva} onChange={e => setFormData({ ...formData, fechareserva: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Hora</label>
                            <select className="lab-input" required value={formData.horainicio} onChange={e => setFormData({ ...formData, horainicio: e.target.value })}>
                                <option value="">-- Seleccione --</option>
                                {timeSlots.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                            </select>
                        </div>

                        {/* Persona Selector Logic */}
                        <div className="pill-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {personaOptions.map(opt => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    disabled={isRomanticSelected && opt.key !== 'pareja'}
                                    className={`pill-tab ${personaTipo === opt.key ? 'pill-tab-active' : ''}`}
                                    onClick={() => setPersonaTipo(opt.key)}
                                >
                                    {opt.label} ({opt.hint})
                                </button>
                            ))}
                        </div>
                        {personaTipo === 'familiar' && (
                            <input type="number" className="lab-input" min="3" max="12" value={familiarCount} onChange={e => setFamiliarCount(e.target.value)} />
                        )}

                        <div className="actions-inline" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-lab" onClick={() => setStep(2)}>Atrás</button>
                            <button type="submit" className="btn-lab btn-lab-primary">Buscar Mesa</button>
                        </div>
                    </form>
                )}

                {/* STEP 4: Confirmar */}
                {step === 4 && (
                    <div className="form-shell" style={{ maxWidth: '540px', margin: '0 auto' }}>
                        {user?.dni === 'admin' && (
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label>Cliente</label>
                                <select className="lab-input" value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}>
                                    <option value="">-- Seleccionar --</option>
                                    {clientesList.map(c => <option key={c.id || c.idcliente} value={c.id || c.idcliente}>{c.nombres}</option>)}
                                </select>
                            </div>
                        )}

                        <label>Seleccione Mesa</label>
                        <div className="selection-grid">
                            {mesasDisponibles.map(mesa => {
                                const isSelected = String(formData.mesa_id) === String(mesa.id);
                                const isReserved = mesa.reservada;
                                return (
                                    <div
                                        key={mesa.id}
                                        className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                        style={{ opacity: isReserved ? 0.5 : 1, cursor: isReserved ? 'not-allowed' : 'pointer' }}
                                        onClick={() => !isReserved && setFormData({ ...formData, mesa_id: mesa.id })}
                                    >
                                        <h4>{mesa.nombre}</h4>
                                        <p>{mesa.ubicacion}</p>
                                        <p>{mesa.capacidad} pax</p>
                                        {isReserved && <span style={{ color: 'red' }}>Reservada</span>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="actions-inline" style={{ marginTop: '20px' }}>
                            <button className="btn-lab" onClick={() => setStep(3)}>Atrás</button>
                            <button className="btn-lab btn-lab-primary" onClick={handleSubmit}>Confirmar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservar;
