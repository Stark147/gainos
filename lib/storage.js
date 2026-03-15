// Simple localStorage-based storage (no backend needed to start)
// Later: swap these functions for Firebase calls

export const storage = {
  // Workouts
  getWorkouts() {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('gainos_workouts') || '[]');
    } catch { return []; }
  },

  saveWorkout(workout) {
    const workouts = this.getWorkouts();
    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    workouts.unshift(newWorkout);
    localStorage.setItem('gainos_workouts', JSON.stringify(workouts));
    return newWorkout;
  },

  // User profile
  getProfile() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('gainos_profile') || 'null');
    } catch { return null; }
  },

  saveProfile(profile) {
    localStorage.setItem('gainos_profile', JSON.stringify(profile));
  },

  // Get last session for a specific exercise (for progressive overload)
  getLastSet(exerciseName) {
    const workouts = this.getWorkouts();
    for (const workout of workouts) {
      const found = workout.exercises?.find(e => e.name === exerciseName);
      if (found && found.sets?.length > 0) {
        const completedSets = found.sets.filter(s => s.done);
        if (completedSets.length > 0) return completedSets;
      }
    }
    return null;
  },

  // Get PR (personal record) for an exercise
  getPR(exerciseName) {
    const workouts = this.getWorkouts();
    let maxWeight = 0;
    for (const workout of workouts) {
      const found = workout.exercises?.find(e => e.name === exerciseName);
      if (found) {
        for (const set of found.sets || []) {
          if (set.done && set.weight > maxWeight) maxWeight = set.weight;
        }
      }
    }
    return maxWeight || null;
  },

  // Get streak
  getStreak() {
    const workouts = this.getWorkouts();
    if (workouts.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [...new Set(workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))].sort((a, b) => b - a);
    const DAY = 86400000;
    let expected = today.getTime();
    for (const d of dates) {
      if (d === expected || d === expected - DAY) {
        streak++;
        expected = d - DAY;
      } else break;
    }
    return streak;
  },

  clearAll() {
    localStorage.removeItem('gainos_workouts');
    localStorage.removeItem('gainos_profile');
  }
};

// Full exercise database — 100+ exercises
export const EXERCISES = {
  Chest: [
    { name: 'Bench Press', muscles: 'Chest, Triceps, Front Delts' },
    { name: 'Incline Bench Press', muscles: 'Upper Chest, Triceps' },
    { name: 'Decline Bench Press', muscles: 'Lower Chest, Triceps' },
    { name: 'Dumbbell Bench Press', muscles: 'Chest, Triceps' },
    { name: 'Incline Dumbbell Press', muscles: 'Upper Chest' },
    { name: 'Dumbbell Fly', muscles: 'Chest' },
    { name: 'Incline Dumbbell Fly', muscles: 'Upper Chest' },
    { name: 'Cable Fly', muscles: 'Chest' },
    { name: 'Low to High Cable Fly', muscles: 'Upper Chest' },
    { name: 'High to Low Cable Fly', muscles: 'Lower Chest' },
    { name: 'Chest Dips', muscles: 'Lower Chest, Triceps' },
    { name: 'Push-ups', muscles: 'Chest, Triceps, Shoulders' },
    { name: 'Machine Chest Press', muscles: 'Chest, Triceps' },
    { name: 'Pec Deck', muscles: 'Chest' },
  ],
  Back: [
    { name: 'Deadlift', muscles: 'Full Back, Glutes, Hamstrings' },
    { name: 'Barbell Row', muscles: 'Upper Back, Lats, Biceps' },
    { name: 'Pendlay Row', muscles: 'Upper Back, Lats' },
    { name: 'Dumbbell Row', muscles: 'Lats, Rhomboids' },
    { name: 'T-Bar Row', muscles: 'Mid Back, Lats' },
    { name: 'Seated Cable Row', muscles: 'Mid Back, Biceps' },
    { name: 'Pull-ups', muscles: 'Lats, Biceps, Core' },
    { name: 'Chin-ups', muscles: 'Lats, Biceps' },
    { name: 'Lat Pulldown', muscles: 'Lats, Biceps' },
    { name: 'Wide Grip Lat Pulldown', muscles: 'Lats' },
    { name: 'Close Grip Lat Pulldown', muscles: 'Lats, Biceps' },
    { name: 'Straight Arm Pulldown', muscles: 'Lats' },
    { name: 'Face Pull', muscles: 'Rear Delts, Upper Back' },
    { name: 'Rack Pull', muscles: 'Upper Back, Traps' },
    { name: 'Shrugs', muscles: 'Traps' },
    { name: 'Hyperextension', muscles: 'Lower Back, Glutes' },
    { name: 'Good Morning', muscles: 'Lower Back, Hamstrings' },
  ],
  Shoulders: [
    { name: 'Overhead Press', muscles: 'Front & Side Delts, Triceps' },
    { name: 'Dumbbell Shoulder Press', muscles: 'Delts, Triceps' },
    { name: 'Arnold Press', muscles: 'All Delts' },
    { name: 'Lateral Raise', muscles: 'Side Delts' },
    { name: 'Cable Lateral Raise', muscles: 'Side Delts' },
    { name: 'Front Raise', muscles: 'Front Delts' },
    { name: 'Rear Delt Fly', muscles: 'Rear Delts' },
    { name: 'Reverse Pec Deck', muscles: 'Rear Delts' },
    { name: 'Upright Row', muscles: 'Side Delts, Traps' },
    { name: 'Machine Shoulder Press', muscles: 'Delts, Triceps' },
  ],
  Biceps: [
    { name: 'Barbell Curl', muscles: 'Biceps' },
    { name: 'Dumbbell Curl', muscles: 'Biceps' },
    { name: 'Hammer Curl', muscles: 'Biceps, Brachialis' },
    { name: 'Incline Dumbbell Curl', muscles: 'Long Head Biceps' },
    { name: 'Concentration Curl', muscles: 'Biceps Peak' },
    { name: 'Preacher Curl', muscles: 'Biceps' },
    { name: 'Cable Curl', muscles: 'Biceps' },
    { name: 'Reverse Curl', muscles: 'Brachialis, Forearms' },
    { name: 'Spider Curl', muscles: 'Biceps' },
    { name: 'Zottman Curl', muscles: 'Biceps, Forearms' },
  ],
  Triceps: [
    { name: 'Tricep Pushdown', muscles: 'Triceps' },
    { name: 'Rope Pushdown', muscles: 'Triceps' },
    { name: 'Overhead Tricep Extension', muscles: 'Long Head Triceps' },
    { name: 'Skull Crushers', muscles: 'Triceps' },
    { name: 'Close Grip Bench Press', muscles: 'Triceps, Chest' },
    { name: 'Tricep Dips', muscles: 'Triceps' },
    { name: 'Diamond Push-ups', muscles: 'Triceps' },
    { name: 'Cable Overhead Extension', muscles: 'Long Head Triceps' },
    { name: 'Kickbacks', muscles: 'Triceps' },
  ],
  Quads: [
    { name: 'Squat', muscles: 'Quads, Glutes, Hamstrings' },
    { name: 'Front Squat', muscles: 'Quads, Core' },
    { name: 'Hack Squat', muscles: 'Quads' },
    { name: 'Leg Press', muscles: 'Quads, Glutes' },
    { name: 'Leg Extension', muscles: 'Quads' },
    { name: 'Bulgarian Split Squat', muscles: 'Quads, Glutes' },
    { name: 'Lunges', muscles: 'Quads, Glutes' },
    { name: 'Walking Lunges', muscles: 'Quads, Glutes' },
    { name: 'Goblet Squat', muscles: 'Quads, Glutes' },
    { name: 'Sissy Squat', muscles: 'Quads' },
  ],
  Hamstrings: [
    { name: 'Romanian Deadlift', muscles: 'Hamstrings, Glutes' },
    { name: 'Stiff Leg Deadlift', muscles: 'Hamstrings, Lower Back' },
    { name: 'Leg Curl', muscles: 'Hamstrings' },
    { name: 'Seated Leg Curl', muscles: 'Hamstrings' },
    { name: 'Nordic Curl', muscles: 'Hamstrings' },
    { name: 'Single Leg RDL', muscles: 'Hamstrings, Balance' },
    { name: 'Glute Ham Raise', muscles: 'Hamstrings, Glutes' },
  ],
  Glutes: [
    { name: 'Hip Thrust', muscles: 'Glutes' },
    { name: 'Barbell Hip Thrust', muscles: 'Glutes' },
    { name: 'Glute Bridge', muscles: 'Glutes' },
    { name: 'Cable Kickback', muscles: 'Glutes' },
    { name: 'Sumo Deadlift', muscles: 'Glutes, Inner Thighs' },
    { name: 'Sumo Squat', muscles: 'Glutes, Inner Thighs' },
    { name: 'Abductor Machine', muscles: 'Glutes, Hip Abductors' },
  ],
  Calves: [
    { name: 'Standing Calf Raise', muscles: 'Gastrocnemius' },
    { name: 'Seated Calf Raise', muscles: 'Soleus' },
    { name: 'Leg Press Calf Raise', muscles: 'Calves' },
    { name: 'Single Leg Calf Raise', muscles: 'Calves' },
  ],
  Core: [
    { name: 'Plank', muscles: 'Core, Shoulders' },
    { name: 'Side Plank', muscles: 'Obliques, Core' },
    { name: 'Cable Crunch', muscles: 'Abs' },
    { name: 'Hanging Leg Raise', muscles: 'Lower Abs, Hip Flexors' },
    { name: 'Ab Wheel', muscles: 'Core, Lats' },
    { name: 'Russian Twist', muscles: 'Obliques' },
    { name: 'Bicycle Crunch', muscles: 'Abs, Obliques' },
    { name: 'Crunch', muscles: 'Abs' },
    { name: 'Dragon Flag', muscles: 'Full Core' },
    { name: 'Toes to Bar', muscles: 'Abs, Hip Flexors' },
    { name: 'Pallof Press', muscles: 'Core, Anti-rotation' },
    { name: 'Dead Bug', muscles: 'Core' },
  ],
  Cardio: [
    { name: 'Treadmill Run', muscles: 'Cardio, Legs' },
    { name: 'Incline Walk', muscles: 'Cardio, Glutes' },
    { name: 'Stationary Bike', muscles: 'Cardio, Quads' },
    { name: 'Rowing Machine', muscles: 'Cardio, Full Body' },
    { name: 'Jump Rope', muscles: 'Cardio, Calves' },
    { name: 'Stair Climber', muscles: 'Cardio, Glutes, Quads' },
    { name: 'Battle Ropes', muscles: 'Cardio, Shoulders, Arms' },
    { name: 'Box Jumps', muscles: 'Power, Quads, Glutes' },
    { name: 'Burpees', muscles: 'Full Body, Cardio' },
    { name: 'Kettlebell Swing', muscles: 'Hips, Glutes, Cardio' },
  ],
};

// Flat list of ALL exercises for search
export const ALL_EXERCISES = Object.entries(EXERCISES).flatMap(([category, exercises]) =>
  exercises.map(ex => ({ ...ex, category }))
);
