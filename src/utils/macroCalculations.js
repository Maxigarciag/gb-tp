/**
 * Utilidades para cálculo de macronutrientes
 * BMR, TDEE y distribución de macros
 */

/**
 * Calcula el Metabolismo Basal (BMR)
 * Usa Katch-McArdle si hay grasa corporal, sino Mifflin-St Jeor
 */
export function calculateBMR(gender, weight, height, age, bodyFat) {
  if (bodyFat && bodyFat > 0 && bodyFat < 100) {
    const leanMass = weight * (1 - bodyFat / 100);
    return 370 + 21.6 * leanMass;
  }

  if (gender === 'hombre') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calcula el Gasto Energético Total Diario (TDEE)
 */
export function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * activityLevel);
}

/**
 * Calcula las calorías objetivo según el goal
 */
export function calculateTargetCalories(tdee, goal, adjustment) {
  if (goal === 'deficit') {
    return tdee - adjustment;
  } else if (goal === 'superavit') {
    return tdee + adjustment;
  }
  return tdee;
}

/**
 * Calcula la distribución de macronutrientes
 */
export function calculateMacros(targetCalories, weight, goal, bodyFat) {
  let protein;
  let fats;
  let carbs;

  if (goal === 'deficit') {
    const proteinPerKg = bodyFat && bodyFat > 25 ? 2 : 2.3;
    protein = Math.round(weight * proteinPerKg);
    const proteinCalories = protein * 4;

    fats = Math.round((targetCalories * 0.25) / 9);
    const fatCalories = fats * 9;

    carbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4);
  } else if (goal === 'superavit') {
    protein = Math.round(weight * 2);
    const proteinCalories = protein * 4;

    fats = Math.round((targetCalories * 0.25) / 9);
    const fatCalories = fats * 9;

    carbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4);
  } else {
    protein = Math.round((targetCalories * 0.3) / 4);
    carbs = Math.round((targetCalories * 0.4) / 4);
    fats = Math.round((targetCalories * 0.3) / 9);
  }

  return { protein, carbs, fats };
}

/**
 * Calcula todos los resultados a partir de los datos del formulario
 */
export function calculateResults(formData) {
  const bmr = calculateBMR(
    formData.gender,
    formData.weight,
    formData.height,
    formData.age,
    formData.bodyFat
  );

  const maintenanceCalories = calculateTDEE(bmr, formData.activityLevel);

  const targetCalories = calculateTargetCalories(
    maintenanceCalories,
    formData.goal,
    formData.calorieAdjustment
  );

  const { protein, carbs, fats } = calculateMacros(
    targetCalories,
    formData.weight,
    formData.goal,
    formData.bodyFat
  );

  return {
    bmr: Math.round(bmr),
    maintenanceCalories,
    targetCalories,
    protein,
    carbs,
    fats,
  };
}

