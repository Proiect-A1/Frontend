public class Main {
    public static void main(String[] args) {
        ProblemSubmission submission = new ProblemSubmission(
                "123",
                "gigel",
                "Java",
                1000,
                1024);
        String finalVerdict = submission.evaluateSubmission(670, 4542);
        System.out.println(finalVerdict);

        UserProfileAi studentProfile = new UserProfileAi("dev_student_2026", 80, 5);

        System.out.println("--- Initial Profile Status ---");
        System.out.println("User: " + studentProfile.getUsername() + " | Score: " + studentProfile.getTotalScore());
        System.out.println("------------------------------\n");

        studentProfile.addSuccessfulSubmission(50);
        }
}

