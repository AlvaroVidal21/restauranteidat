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
    const [clientFocus, setClientFocus] = useState(false);

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
        drinkPrice: 0,
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
        const isAdminUser = parsedUser.dni === 'admin' || parsedUser.dni === '00000000' || parsedUser.id === 1;
        setUser(parsedUser);
        // Admin siempre debe seleccionar cliente manualmente
        setFormData(prev => ({ ...prev, cliente_id: isAdminUser ? '' : (parsedUser.id || parsedUser.idcliente) }));

        if (isAdminUser) {
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
            drinkName: drink.nombre || drink.nombreplato,
            drinkPrice: parseFloat(drink.precio || 0)
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
        // Check if user is admin
        const isAdmin = user?.dni === 'admin' || user?.dni === '00000000' || user?.id === 1;

        if (!formData.experiencia_id) {
            Swal.fire('Selecciona una experiencia', 'Debes elegir una experiencia antes de continuar.', 'warning');
            return;
        }

        if (!formData.mesa_id) {
            Swal.fire('Selecciona una mesa', 'Debes elegir una mesa antes de confirmar.', 'warning');
            return;
        }

        let finalClienteId = formData.cliente_id;

        // Admin MUST select a client - cannot reserve for themselves
        if (isAdmin) {
            if (!formData.cliente_id) {
                Swal.fire('Seleccione cliente', 'El administrador debe reservar para un cliente registrado. No puede reservar para sí mismo.', 'error');
                return;
            }
            finalClienteId = formData.cliente_id;
        } else {
            // For regular users, use their own ID
            finalClienteId = user?.id || user?.idcliente;
            if (!finalClienteId) {
                Swal.fire('Error', 'No se pudo identificar al cliente. Por favor inicie sesión nuevamente.', 'error');
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

        const extrasTotal = formData.opcionales.reduce((acc, id) => {
            const p = platos.find(pl => pl.id === id);
            return acc + (p ? parseFloat(p.precio) : 0);
        }, 0);

        const payload = {
            cliente_id: finalClienteId,
            mesa_id: formData.mesa_id,
            fecha: formData.fechareserva,
            hora_inicio: formData.horainicio,
            hora_fin: formData.horafin,
            cantidad_personas: formData.cantidadpersonas,
            motivo: formData.motivo,
            detalles_consumo: detalles,
            total: parseFloat(formData.selectedItemPrice) + parseFloat(formData.drinkPrice || 0) + extrasTotal
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
                                        <p style={{ fontSize: '12px', marginBottom: '5px' }}>{drink.descripcion}</p>
                                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>${parseFloat(drink.precio || 0).toFixed(2)}</span>
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
                        {/* Summary of Additionals */}
                        {formData.opcionales.length > 0 && (
                            <div className="summary-box" style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)', paddingTop: '15px' }}>
                                <h4 style={{ marginBottom: '10px' }}>Adicionales seleccionados:</h4>
                                <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
                                    {formData.opcionales.map(id => {
                                        const p = platos.find(pl => pl.id === id);
                                        return p ? (
                                            <li key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>{p.nombre}</span>
                                                <span>${parseFloat(p.precio).toFixed(2)}</span>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px' }}>
                                    Total Adicionales: $
                                    {formData.opcionales.reduce((acc, id) => {
                                        const p = platos.find(pl => pl.id === id);
                                        return acc + (p ? parseFloat(p.precio) : 0);
                                    }, 0).toFixed(2)}
                                </div>
                            </div>
                        )}

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
                        <div className="persona-grid">
                            {personaOptions.map(opt => {
                                const selected = personaTipo === opt.key;
                                const disabledChoice = isRomanticSelected && opt.key !== 'pareja';
                                const pillClasses = [
                                    'persona-pill',
                                    selected ? 'is-selected' : '',
                                    disabledChoice ? 'is-disabled' : ''
                                ].join(' ').trim();
                                return (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        disabled={disabledChoice}
                                        aria-pressed={selected}
                                        aria-disabled={disabledChoice}
                                        className={pillClasses}
                                        onClick={() => !disabledChoice && setPersonaTipo(opt.key)}
                                    >
                                        <span className="persona-icon">
                                            <opt.Icon />
                                        </span>
                                        <span className="persona-copy">
                                            <span className="persona-title">{opt.label}</span>
                                            <span className="persona-hint">{opt.hint}</span>
                                        </span>
                                        {disabledChoice && <span className="persona-badge">Bloqueado</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {isRomanticSelected && (
                            <p style={{ fontSize: '12px', color: '#a67c2e', marginTop: '6px' }}>La experiencia romántica fija el modo pareja para preservar la atmósfera.</p>
                        )}
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
                    <div className="form-shell" style={{ maxWidth: '640px', margin: '0 auto' }}>
                        {/* COST SUMMARY */}
                        <div className="summary-box" style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Resumen de Reserva</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>{formData.selectedItemName}</span>
                                <span>${parseFloat(formData.selectedItemPrice).toFixed(2)}</span>
                            </div>
                            {formData.drinkName && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>{formData.drinkName} (Bebida)</span>
                                    <span>${parseFloat(formData.drinkPrice || 0).toFixed(2)}</span>
                                </div>
                            )}
                            {formData.opcionales.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Extras ({formData.opcionales.length})</span>
                                    <span>
                                        ${formData.opcionales.reduce((acc, id) => {
                                            const p = platos.find(pl => pl.id === id);
                                            return acc + (p ? parseFloat(p.precio) : 0);
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                <span>Total Estimado:</span>
                                <span>
                                    ${(() => {
                                        const extrasTotal = formData.opcionales.reduce((acc, id) => {
                                            const p = platos.find(pl => pl.id === id);
                                            return acc + (p ? parseFloat(p.precio) : 0);
                                        }, 0);
                                        return (
                                            parseFloat(formData.selectedItemPrice) +
                                            parseFloat(formData.drinkPrice || 0) +
                                            extrasTotal
                                        ).toFixed(2);
                                    })()}
                                </span>
                            </div>
                        </div>


                        {(user?.dni === 'admin' || user?.dni === '00000000' || user?.id === 1) && (
                            <div className="admin-client-card">
                                <div className="admin-client-header">
                                    <label>Reservar para el cliente</label>
                                    <span>Obligatorio para admin</span>
                                </div>
                                {(() => {
                                    const hasClient = !!formData.cliente_id;
                                    const stateLabel = hasClient ? 'Listo' : 'Pendiente';
                                    const shellClasses = [
                                        'admin-client-shell',
                                        hasClient ? 'is-filled' : 'is-empty',
                                        clientFocus ? 'is-focus' : ''
                                    ].join(' ').trim();
                                    return (
                                        <div className={shellClasses} data-state={stateLabel}>
                                            <select
                                                className="admin-client-select"
                                                value={formData.cliente_id}
                                                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                                                onFocus={() => setClientFocus(true)}
                                                onBlur={() => setClientFocus(false)}
                                                aria-invalid={!hasClient}
                                            >
                                                <option value="">Elegir cliente...</option>
                                                {clientesList.map(c => (
                                                    <option key={c.id || c.idcliente} value={c.id || c.idcliente}>{c.nombres} · DNI {c.dni}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })()}
                                {formData.cliente_id
                                    ? <small className="admin-client-hint ok">Cliente listo: puedes confirmar.</small>
                                    : <small className="admin-client-hint">Selecciona el cliente antes de confirmar.</small>
                                }
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ margin: 0 }}>Seleccione Mesa</label>
                            {mesasDisponibles.length > 0 && (
                                <select
                                    className="filter-select"
                                    value={zonaFiltro}
                                    onChange={(e) => setZonaFiltro(e.target.value)}
                                >
                                    <option value="">Todas las zonas ({mesasDisponibles.length})</option>
                                    {[...new Set(mesasDisponibles.map(m => m.ubicacion))].map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            )}
                        </div>

                        <div className="selection-grid">
                            {mesasDisponibles
                                .filter(m => zonaFiltro ? m.ubicacion === zonaFiltro : true)
                                .map(mesa => {
                                    const isSelected = String(formData.mesa_id) === String(mesa.id);
                                    const isReserved = mesa.reservada;
                                    // Visual cue if table is 'too big' for selection? Strict check?
                                    // For now just show capacity.
                                    return (
                                        <div
                                            key={mesa.id}
                                            className={`lab-card selectable-card ${isSelected ? 'card-active' : ''}`}
                                            style={{
                                                opacity: isReserved ? 0.6 : 1,
                                                cursor: isReserved ? 'not-allowed' : 'pointer',
                                                border: isReserved ? '1px dashed #ccc' : undefined,
                                                background: isReserved ? '#f5f5f5' : undefined
                                            }}
                                            onClick={() => !isReserved && setFormData({ ...formData, mesa_id: mesa.id })}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h4 style={{ marginBottom: '5px' }}>{mesa.nombre}</h4>
                                                {isReserved && <span style={{ fontSize: '10px', background: '#ffdddd', color: 'red', padding: '2px 6px', borderRadius: '4px', height: 'fit-content' }}>RESERVADA</span>}
                                            </div>
                                            <p style={{ marginBottom: '0', fontSize: '13px' }}>{mesa.ubicacion}</p>
                                            <p style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>{mesa.capacidad} Sillas</p>
                                        </div>
                                    )
                                })}
                        </div>

                        {mesasDisponibles.filter(m => zonaFiltro ? m.ubicacion === zonaFiltro : true).length === 0 && (
                            <p className="text-muted text-center" style={{ padding: '20px' }}>No hay mesas disponibles en esta zona para la capacidad seleccionada.</p>
                        )}

                        <div className="actions-inline" style={{ marginTop: '20px' }}>
                            <button className="btn-lab" onClick={() => setStep(3)}>Atrás</button>
                            <button className="btn-lab btn-lab-primary" onClick={handleSubmit}>Confirmar Reserva</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservar;
