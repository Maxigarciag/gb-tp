import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Calculator, Search, Loader, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import '@/styles/components/nutricion/MealsTracker.css'

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno', color: 'amber' },
  { id: 'lunch', label: 'Almuerzo', color: 'green' },
  { id: 'merienda', label: 'Merienda', color: 'blue' },
  { id: 'dinner', label: 'Cena', color: 'purple' },
  { id: 'snack', label: 'Snack', color: 'pink' },
]

const MealsTracker = () => {
  const [foods, setFoods] = useState([])
  const [meals, setMeals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('')
  const [selectedMealType, setSelectedMealType] = useState('breakfast')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    const loadFoodsAndMeals = async () => {
      setLoading(true)
      try {
        const { data: foodsData } = await supabase
          .from('foods')
          .select('*')
          .order('name')

        const { data: mealsData } = await supabase
          .from('meals_log')
          .select('*')
          .eq('date', today)
          .order('created_at')

        setFoods(foodsData || [])
        setMeals(mealsData || [])
      } catch (err) {
        console.error('Error loading data:', err)
      }
      setLoading(false)
    }

    loadFoodsAndMeals()
  }, [today])

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
      calories: parseFloat((foodData.calories_per_100g * multiplier).toFixed(1)),
      protein: parseFloat((foodData.protein_per_100g * multiplier).toFixed(1)),
      carbs: parseFloat((foodData.carbs_per_100g * multiplier).toFixed(1)),
      fats: parseFloat((foodData.fats_per_100g * multiplier).toFixed(1)),
    }
  }, [])

  const handleAddMeal = useCallback(async () => {
    if (!selectedFood && !searchTerm) {
      setError('Por favor selecciona o busca un alimento')
      return
    }

    if (!grams) {
      setError('Por favor ingresa una cantidad')
      return
    }

    setCalculating(true)
    setError('')

    try {
      let foodData = selectedFood

      if (!foodData) {
        const data = await searchNutritionOnline(searchTerm)
        foodData = data

        const { data: inserted } = await supabase
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

        if (inserted) {
          const merged = { ...data, id: inserted.id }
          setFoods(prev => [...prev, merged])
          foodData = merged
          setSelectedFood(merged)
        }
      }

      const macros = calculateFromFood(foodData, grams)

      const mealEntry = {
        meal_type: selectedMealType,
        food_name: foodData.name,
        quantity_grams: parseFloat(grams),
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        date: today,
      }

      const { data: newMeal } = await supabase
        .from('meals_log')
        .insert([mealEntry])
        .select()
        .maybeSingle()

      if (newMeal) {
        setMeals(prev => [...prev, newMeal])
        setSearchTerm('')
        setSelectedFood(null)
        setGrams('')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('No se encontró información del alimento. Intenta otro nombre.')
    } finally {
      setCalculating(false)
    }
  }, [calculateFromFood, grams, searchNutritionOnline, searchTerm, selectedFood, selectedMealType, today])

  const handleDeleteMeal = useCallback(async (id) => {
    try {
      await supabase
        .from('meals_log')
        .delete()
        .eq('id', id)

      setMeals(prev => prev.filter(meal => meal.id !== id))
    } catch (err) {
      console.error('Error deleting meal:', err)
    }
  }, [])

  const calculateTotals = useCallback((items) => ({
    calories: items.reduce((sum, m) => sum + m.calories, 0).toFixed(1),
    protein: items.reduce((sum, m) => sum + m.protein, 0).toFixed(1),
    carbs: items.reduce((sum, m) => sum + m.carbs, 0).toFixed(1),
    fats: items.reduce((sum, m) => sum + m.fats, 0).toFixed(1),
  }), [])

  const mealsByType = useMemo(() => MEAL_TYPES.map(type => {
    const items = meals.filter(m => m.meal_type === type.id)
    return {
      ...type,
      items,
      totals: calculateTotals(items)
    }
  }), [calculateTotals, meals])

  const mealsWithItems = useMemo(
    () => mealsByType.filter(meal => meal.items.length > 0),
    [mealsByType]
  )
  const hasMeals = mealsWithItems.length > 0

  const dailyTotals = useMemo(() => ({
    calories: meals.reduce((sum, m) => sum + m.calories, 0).toFixed(1),
    protein: meals.reduce((sum, m) => sum + m.protein, 0).toFixed(1),
    carbs: meals.reduce((sum, m) => sum + m.carbs, 0).toFixed(1),
    fats: meals.reduce((sum, m) => sum + m.fats, 0).toFixed(1),
  }), [meals])

  if (loading) {
    return (
      <div className="meals-loader">
        <Loader className="meals-loader__icon spin" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="meals-tracker">
      <div className="meals-card">
        <div className="meals-card__header">
          <div className="meals-card__title">
            <Calculator aria-hidden="true" />
            <div>
              <p className="meals-eyebrow">Nutrición</p>
              <h3>Seguimiento de Macros</h3>
              <p className="meals-subtitle">Organiza tus alimentos por comidas del día.</p>
            </div>
          </div>
        </div>

        <div className="meals-card__body">
          <div className="meals-form">
            <div className="meals-field">
              <label className="meals-label">Buscar alimento</label>
              <div className="meals-input-wrapper">
                <Search className="meals-input-icon" aria-hidden="true" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busca un alimento..."
                  className="meals-input"
                />
              </div>
              {!!searchTerm && filteredFoods.length > 0 && (
                <div className="meals-results">
                  {filteredFoods.map(food => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => {
                        setSelectedFood(food)
                        setSearchTerm(food.name)
                      }}
                      className="meals-result-item"
                    >
                      <span className="meals-result-name">{food.name}</span>
                      <span className="meals-result-meta">({food.calories_per_100g} kcal/100g)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="meals-field-grid">
              <div className="meals-field">
                <label className="meals-label">Tipo de comida</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="meals-input"
                >
                  {MEAL_TYPES.map(meal => (
                    <option key={meal.id} value={meal.id}>{meal.label}</option>
                  ))}
                </select>
              </div>
              <div className="meals-field">
                <label className="meals-label">Cantidad (gramos)</label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="Ej: 150"
                  min="0"
                  step="1"
                  className="meals-input"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMeal}
              disabled={calculating}
              className="meals-btn primary"
            >
              {calculating ? (
                <>
                  <Loader className="meals-btn__icon spin" aria-hidden="true" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="meals-btn__icon" aria-hidden="true" />
                  Agregar alimento
                </>
              )}
            </button>

            {error && (
              <div className="meals-alert error" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasMeals ? (
        <div className="meals-grid">
          {mealsWithItems.map(mealType => (
            <div key={mealType.id} className="meal-card">
              <div className={`meal-card__header gradient-${mealType.color}`}>
                <div>
                  <h4>{mealType.label}</h4>
                  <p>{mealType.items.length} alimento(s)</p>
                </div>
              </div>

              <div className="meal-card__body">
                {mealType.items.map(meal => (
                  <div key={meal.id} className="meal-item">
                    <div className="meal-item__header">
                      <div>
                        <p className="meal-item__name">{meal.food_name}</p>
                        <p className="meal-item__grams">{meal.quantity_grams}g</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="meal-item__delete"
                        aria-label="Eliminar alimento"
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                    <div className="meal-item__macros">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein}g prot</span>
                      <span>{meal.carbs}g carb</span>
                      <span>{meal.fats}g grasa</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="meal-card__totals">
                <div className="meal-card__total-row">
                  <span>Cal:</span>
                  <strong className="accent-orange">{mealType.totals.calories}</strong>
                </div>
                <div className="meal-card__total-row">
                  <span>Prot:</span>
                  <strong className="accent-red">{mealType.totals.protein}g</strong>
                </div>
                <div className="meal-card__total-row">
                  <span>Carbs:</span>
                  <strong className="accent-blue">{mealType.totals.carbs}g</strong>
                </div>
                <div className="meal-card__total-row">
                  <span>Grasas:</span>
                  <strong className="accent-yellow">{mealType.totals.fats}g</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="meals-empty-grid">
          Agrega tu primer alimento para ver las tarjetas por comida.
        </div>
      )}

      <div className="meals-card totals">
        <div className="meals-card__header indigo">
          <h4>Totales del día</h4>
        </div>
        <div className="meals-totals-grid">
          <div className="meals-total-card orange">
            <p>Calorías</p>
            <span>{dailyTotals.calories}</span>
            <small>kcal</small>
          </div>
          <div className="meals-total-card red">
            <p>Proteína</p>
            <span>{dailyTotals.protein}</span>
            <small>g</small>
          </div>
          <div className="meals-total-card blue">
            <p>Carbohidratos</p>
            <span>{dailyTotals.carbs}</span>
            <small>g</small>
          </div>
          <div className="meals-total-card yellow">
            <p>Grasas</p>
            <span>{dailyTotals.fats}</span>
            <small>g</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealsTracker


