'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Step = 'account' | 'body' | 'goal'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Body
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [birthDate, setBirthDate] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')

  // Goal
  const [goalWeight, setGoalWeight] = useState('')

  const handleRegister = async () => {
  setLoading(true)
  setError('')

  // 1. Registrácia
  const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError || !data.user) {
    setError(signUpError?.message || 'Chyba pri registrácii.')
    setLoading(false)
    return
  }

  // 2. AKTUALIZÁCIA (namiesto insert)
  // Keďže trigger vytvoril prázdny profil, my ho teraz len doplníme údajmi
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      height_cm: parseInt(heightCm),
      birth_date: birthDate,
      gender,
      start_weight_kg: parseFloat(weightKg),
      current_weight_kg: parseFloat(weightKg),
      goal_weight_kg: parseFloat(goalWeight),
      last_weigh_in: new Date().toISOString().split('T')[0],
    })
    .eq('id', data.user.id) // TOTO je kritická zmena

  if (profileError) {
    setError('Profil sa nepodarilo aktualizovať: ' + profileError.message)
    setLoading(false)
    return
  }

  router.push('/dashboard')
}

  const stepLabels = { account: 1, body: 2, goal: 3 }
  const currentStep = stepLabels[step]

  return (
    <div className="min-h-screen flex flex-col p-6 safe-top">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                n <= currentStep ? 'bg-[var(--red)]' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
          Krok {currentStep} z 3
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Step 1 – Account */}
      {step === 'account' && (
        <div className="stagger flex-1 flex flex-col">
          <h2 className="font-display text-5xl text-white mb-1">VYTVOR<br /><span className="text-[var(--red)]">ÚČET</span></h2>
          <p className="text-[var(--text-muted)] text-sm mb-8">Tvoja cesta sa začína tu.</p>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Meno</label>
              <input className="slim-input" placeholder="Tvoje meno" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email</label>
              <input type="email" className="slim-input" placeholder="tvoj@email.sk" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Heslo</label>
              <input type="password" className="slim-input" placeholder="Min. 6 znakov" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button
            className="btn-primary mt-6"
            onClick={() => {
              if (!fullName || !email || password.length < 6) {
                setError('Vyplň všetky polia. Heslo min. 6 znakov.')
                return
              }
              setError('')
              setStep('body')
            }}
          >
            ĎALEJ →
          </button>
          <p className="text-center text-[var(--text-muted)] text-sm pt-4">
            Máš účet?{' '}
            <Link href="/auth/login" className="text-[var(--red)]">Prihlás sa</Link>
          </p>
        </div>
      )}

      {/* Step 2 – Body */}
      {step === 'body' && (
        <div className="stagger flex-1 flex flex-col">
          <h2 className="font-display text-5xl text-white mb-1">TVOJE<br /><span className="text-[var(--red)]">TELO</span></h2>
          <p className="text-[var(--text-muted)] text-sm mb-8">Potrebujeme tieto údaje pre presné výpočty.</p>

          <div className="space-y-4 flex-1">
            {/* Gender */}
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Pohlavie</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`p-4 rounded-2xl border text-sm font-medium transition-all ${
                      gender === g
                        ? 'bg-[var(--red)] border-[var(--red)] text-white'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {g === 'male' ? '♂ Muž' : '♀ Žena'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Dátum narodenia</label>
              <input type="date" className="slim-input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Výška (cm)</label>
              <input type="number" className="slim-input" placeholder="napr. 180" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Aktuálna váha (kg)</label>
              <input type="number" step="0.1" className="slim-input" placeholder="napr. 95.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="btn-ghost flex-1" onClick={() => setStep('account')}>← Späť</button>
            <button
              className="btn-primary flex-[2]"
              onClick={() => {
                if (!birthDate || !heightCm || !weightKg) {
                  setError('Vyplň všetky polia.')
                  return
                }
                setError('')
                setStep('goal')
              }}
            >
              ĎALEJ →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 – Goal */}
      {step === 'goal' && (
        <div className="stagger flex-1 flex flex-col">
          <h2 className="font-display text-5xl text-white mb-1">TVOJ<br /><span className="text-[var(--red)]">CIEĽ</span></h2>
          <p className="text-[var(--text-muted)] text-sm mb-8">Aká je tvoja vysnívaná váha?</p>

          <div className="glow-card p-5 mb-6">
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Aktuálna váha</p>
            <p className="font-display text-5xl text-white">{weightKg} <span className="text-2xl text-[var(--text-muted)]">kg</span></p>
          </div>

          <div className="flex-1">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Cieľová váha (kg)</label>
            <input
              type="number"
              step="0.1"
              className="slim-input"
              placeholder="napr. 80"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
            />

            {goalWeight && weightKg && (
              <div className="mt-4 p-4 bg-[var(--surface-2)] rounded-xl">
                <p className="text-[var(--text-muted)] text-sm">
                  Musíš schudnúť{' '}
                  <span className="text-[var(--red)] font-bold text-lg">
                    {(parseFloat(weightKg) - parseFloat(goalWeight)).toFixed(1)} kg
                  </span>
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-1">
                  Pri deficite 500 kcal/deň to zvládneš za{' '}
                  <span className="text-white">
                    ~{Math.ceil(((parseFloat(weightKg) - parseFloat(goalWeight)) * 7700) / 500)} dní
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button className="btn-ghost flex-1" onClick={() => setStep('body')}>← Späť</button>
            <button
              className="btn-primary flex-[2]"
              onClick={() => {
                if (!goalWeight) {
                  setError('Zadaj cieľovú váhu.')
                  return
                }
                handleRegister()
              }}
              disabled={loading}
            >
              {loading ? 'Vytváram...' : 'ZAČÍNAME! 🔥'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
