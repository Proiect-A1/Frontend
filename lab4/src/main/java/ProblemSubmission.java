public class ProblemSubmission {
    private String submissionId;
    private String username;
    private String programmingLanguage;
    private int executionTime;
    private int memoryUsage;

    public ProblemSubmission(String submissionId, String username, String programmingLanguage, int executionTime, int memoryUsage) {
        this.submissionId = submissionId;
        this.username = username;
        this.programmingLanguage = programmingLanguage;
        this.executionTime = executionTime;
        this.memoryUsage = memoryUsage;
    }

    public String evaluateSubmission(int maxTime, int maxMemory){
        System.out.println("Evaluating submission...");

        if (this.executionTime > maxTime) {
            return "Time Limit Exceeded";
        } else if (this.memoryUsage > maxMemory) {
            return "Memory Limit Exceeded";
        } else {
            return "Accepted";
        }
    }

}


