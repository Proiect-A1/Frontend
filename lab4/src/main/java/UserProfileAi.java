public class UserProfileAi {

    // 1. ATRIBUTE (2 puncte)
    private String username;
    private int totalScore;
    private int problemsSolved;

    // Constructor to initialize the attributes
    public UserProfileAi(String username, int totalScore, int problemsSolved) {
        this.username = username;
        this.totalScore = totalScore;
        this.problemsSolved = problemsSolved;
    }

    // 2. O METODĂ MAI IMPORTANTĂ (2 puncte)
    // This method simulates a user successfully solving a new problem on the platform
    public void addSuccessfulSubmission(int pointsEarned) {
        this.problemsSolved += 1;
        this.totalScore += pointsEarned;

        System.out.println("Success! " + this.username + " solved a new problem.");
        System.out.println("Points earned: " + pointsEarned);
        System.out.println("New Total Score: " + this.totalScore);
        System.out.println("Current Rank: " + this.getRankTier());
    }

    // Helper method to determine the user's rank based on their score
    private String getRankTier() {
        if (this.totalScore < 100) {
            return "Începător (Novice)";
        } else if (this.totalScore < 500) {
            return "Intermediar (Intermediate)";
        } else {
            return "Avansat (Expert)";
        }
    }

    public String getUsername() {
        return username;
    }

    public int getTotalScore() {
        return totalScore;
    }
}