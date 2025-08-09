const fs = require('fs')

// Read the file
let content = fs.readFileSync('app/api/jobs/route.ts', 'utf8')

// Find the line to replace
const lines = content.split('\n')
const targetLineIndex = lines.findIndex(line => line.includes('match_score: Math.floor(Math.random() * 30) + 70'))

if (targetLineIndex !== -1) {
  // Insert the new match scoring logic after the placeholder
  const insertIndex = targetLineIndex + 2 // After the })) line
  
  const newCode = `
      // Calculate match scores if user is authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Get candidate profile for match scoring
          const { data: candidateProfile } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', user.id)
            .single()
          
          if (candidateProfile) {
            // Calculate match scores for each job
            jobsWithScores = await Promise.all(
              jobsWithScores.map(async (job: any) => {
                try {
                  const matchScore = await calculateJobMatchScore(job, candidateProfile)
                  return {
                    ...job,
                    match_score: matchScore
                  }
                } catch (error) {
                  console.error('Error calculating match score for job:', job.id, error)
                  return job // Keep original score
                }
              })
            )
          }
        }
      } catch (authError) {
        // User not authenticated or other auth error, continue without match scores
        console.log('No authenticated user for match scoring')
      }
`
  
  lines.splice(insertIndex, 0, newCode)
  
  // Write back to file
  fs.writeFileSync('app/api/jobs/route.ts', lines.join('\n'))
  
  console.log('Successfully updated app/api/jobs/route.ts')
} else {
  console.log('Could not find target line')
}