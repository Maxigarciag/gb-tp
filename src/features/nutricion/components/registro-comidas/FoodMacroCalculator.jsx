import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Calculator, Search, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/hooks/useIsMobile'
import '@/styles/components/nutricion/FoodMacroCalculator.css'

const FoodMacroCalculator = () => {
  const isMobile = useIsMobile()
  const [foods, setFoods] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [macros, setMacros] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFoods = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('foods')
        .select('*')
        .order('name')

      if (fetchError) {
        console.error('Error loading foods:', fetchError)
      } else {
        setFoods(data || [])
      }
      setLoading(false)
    }

    loadFoods()
  }, [])

  const filteredFoods = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []
    return foods.filter(food => food.name?.toLowerCase().includes(term))
  }, [foods, searchTerm])

  const translateFoodName = useCallback(async (foodName) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ foodName }),
      })
      if (!res.ok) throw new Error('No se pudo traducir')
      const data = await res.json()
      return data.translated || foodName
    } catch (e) {
      console.warn('Fallo traducir alimento, uso original:', e)
      return foodName
    }
  }, [])

  const searchNutritionOnline = useCallback(async (foodName) => {
    const translated = await translateFoodName(foodName)
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-nutrition`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ foodName: translated }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch nutrition data')
    }

    return response.json()
  }, [translateFoodName])

  const calculateFromFood = useCallback((foodData, gramsValue) => {
    const gramsNum = parseFloat(gramsValue)
    const multiplier = gramsNum / 100
    return {
      calories: (foodData.calories_per_100g * multiplier).toFixed(1),
      protein: (foodData.protein_per_100g * multiplier).toFixed(1),
      carbs: (foodData.carbs_per_100g * multiplier).toFixed(1),
      fats: (foodData.fats_per_100g * multiplier).toFixed(1),
    }
  }, [])

  const handleCalculate = useCallback(() => {
    if (!selectedFood || !grams) {
      setError('Por favor selecciona un alimento y una cantidad')
      return
    }
    setError('')
    setCalculating(true)
    try {
      setMacros(calculateFromFood(selectedFood, grams))
    } finally {
      setCalculating(false)
    }
  }, [calculateFromFood, grams, selectedFood])

  const handleSearchAndCalculate = useCallback(async () => {
    if (!searchTerm || !grams) {
      setError('Por favor ingresa un alimento y una cantidad')
      return
    }

    setCalculating(true)
    setError('')

    try {
      let foodData = selectedFood

      if (!foodData) {
        const data = await searchNutritionOnline(searchTerm)
        foodData = data

        const { error: insertError, data: inserted } = await supabase
          .from('foods')
          .insert([{
            name: data.name,
            calories_per_100g: data.calories_per_100g,
            protein_per_100g: data.protein_per_100g,
            carbs_per_100g: data.carbs_per_100g,
            fats_per_100g: data.fats_per_100g,
          }])
          .select()
          .maybeSingle()

        if (!insertError && inserted) {
          const merged = { ...data, id: inserted.id }
          setFoods(prev => [...prev, merged])
          foodData = merged
        }
      }

      setSelectedFood(foodData)
      setMacros(calculateFromFood(foodData, grams))
    } catch (err) {
      console.error('Error:', err)
      setError('No se encontró información del alimento. Intenta otro nombre.')
    } finally {
      setCalculating(false)
    }
  }, [calculateFromFood, grams, searchNutritionOnline, searchTerm, selectedFood])

  const showSearchResults = !!searchTerm && filteredFoods.length > 0

  return (
    <div className="food-macro">
      <div className="food-macro__header">
        <div className="food-macro__title">
          <Calculator aria-hidden="true" />
          <div>
            <p className="food-macro__eyebrow">Nutrición</p>
            <h3>Calculadora de Macros por Alimento</h3>
            <p className="food-macro__subtitle">
              Ingresa un alimento y su cantidad para obtener calorías y macros estimados.
            </p>
          </div>
        </div>
      </div>

      <div className="food-macro__body">
        <div className="food-macro__field">
          <label className="food-macro__label">Buscar alimento</label>
          <div className="food-macro__input-wrapper">
            <Search className="food-macro__input-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!e.target.value) {
                  setSelectedFood(null)
                  setMacros(null)
                }
              }}
              placeholder="Ej: pechuga de pollo"
              className="food-macro__input"
            />
          </div>
          {showSearchResults && (
            <div className="food-macro__results">
              {filteredFoods.map(food => (
                <button
                  key={food.id || food.name}
                  type="button"
                  onClick={() => {
                    setSelectedFood(food)
                    setSearchTerm(food.name)
                  }}
                  className="food-macro__result-item"
                >
                  <span className="food-macro__result-name">{food.name}</span>
                  <span className="food-macro__result-meta">({food.calories_per_100g} kcal / 100g)</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="food-macro__field">
          <label className="food-macro__label">Cantidad (gramos)</label>
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="Ej: 150"
            min="0"
            step="1"
            className="food-macro__input"
          />
        </div>

        <div className="food-macro__actions">
          {selectedFood && (
            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating || !grams}
              className="food-macro__btn primary"
            >
              {calculating ? (
                <>
                  <Loader className="food-macro__btn-icon spin" aria-hidden="true" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="food-macro__btn-icon" aria-hidden="true" />
                  Calcular
                </>
              )}
            </button>
          )}

          {!selectedFood && searchTerm && (
            <button
              type="button"
              onClick={handleSearchAndCalculate}
              disabled={calculating || !grams}
              className="food-macro__btn secondary"
            >
              {calculating ? (
                <>
                  <Loader className="food-macro__btn-icon spin" aria-hidden="true" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="food-macro__btn-icon" aria-hidden="true" />
                  Buscar y Calcular
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="food-macro__alert error" role="alert">
            {error}
          </div>
        )}

        {macros && selectedFood && (
          <div className="food-macro__results-card">
            <h4>Resultados para {grams}g de {selectedFood.name}</h4>
            <div className="food-macro__metrics">
              <div className="food-macro__metric">
                <span className="food-macro__metric-label">Calorías</span>
                <span className="food-macro__metric-value accent-orange">{macros.calories}<small>kcal</small></span>
              </div>
              <div className="food-macro__metric">
                <span className="food-macro__metric-label">Proteína</span>
                <span className="food-macro__metric-value accent-red">{macros.protein}<small>g</small></span>
              </div>
              <div className="food-macro__metric">
                <span className="food-macro__metric-label">Carbohidratos</span>
                <span className="food-macro__metric-value accent-blue">{macros.carbs}<small>g</small></span>
              </div>
              <div className="food-macro__metric">
                <span className="food-macro__metric-label">Grasas</span>
                <span className="food-macro__metric-value accent-yellow">{macros.fats}<small>g</small></span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="food-macro__loading">
            <Loader className="food-macro__btn-icon spin" aria-hidden="true" />
            Cargando alimentos...
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodMacroCalculator

