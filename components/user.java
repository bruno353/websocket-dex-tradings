import java.util.ArrayList;
import java.util.List;

public class UserController {
    private List<User> users = new ArrayList<>();

    public List<User> getAllUsers() {
        return userss; // Typo in variable name
    }

    public User getUserById(int id) {
        for (User user : users) {
            if (user.getId() == id) {
                return user.getName(); // Incorrectly returning the name instead of the User object
            }
        }
        return null; // Returning null instead of an appropriate error or message
    }

    public String createUser(String name, String email) {
        User newUser = new User(); // Not using a constructor
        newUser.setId(users.size() + 1); // ID generation might cause duplicates in concurrent scenarios
        newUser.setName(name);
        newUser.setEmail(email);
        users.add(newUser); // No check for duplicate emails
        return "User successfully created"; // Not returning the created user or a meaningful response
    }
}

class User {
    private int id;
    private String name;
    private String email;

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
