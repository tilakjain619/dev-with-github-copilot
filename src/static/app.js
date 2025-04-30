document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Fetch and display participants for each activity
  function loadParticipants(activityName, participantsListElement) {
    fetch(`/activities/${activityName}/participants`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch participants");
        }
        return response.json();
      })
      .then((data) => {
        participantsListElement.innerHTML = ""; // Clear existing list
        data.participants.forEach((participant) => {
          const listItem = document.createElement("li");
          listItem.textContent = participant;
          participantsListElement.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error("Error loading participants:", error);
      });
  }

  // Update activity cards to include participants
  function displayActivities(activities) {
    activitiesList.innerHTML = ""; // Clear existing activities

    Object.keys(activities).forEach((activityName) => {
      const activity = activities[activityName];

      const card = document.createElement("div");
      card.className = "activity-card";

      const title = document.createElement("h4");
      title.textContent = activityName;
      card.appendChild(title);

      const description = document.createElement("p");
      description.textContent = activity.description;
      card.appendChild(description);

      const participantsHeader = document.createElement("h5");
      participantsHeader.textContent = "Participants:";
      card.appendChild(participantsHeader);

      const participantsList = document.createElement("ul");
      participantsList.className = "participants-list";
      card.appendChild(participantsList);

      // Load participants for this activity
      loadParticipants(activityName, participantsList);

      activitiesList.appendChild(card);
    });
  }

  // Fetch and display activities
  fetch("/activities")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return response.json();
    })
    .then((data) => {
      displayActivities(data);
    })
    .catch((error) => {
      console.error("Error loading activities:", error);
    });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
