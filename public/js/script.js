(function () {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  })();


  
  
  
    // Add animation to form submission
    document.addEventListener("DOMContentLoaded", function () {
      const signupForm = document.getElementById("signupForm");
      signupForm.addEventListener("submit", function (e) {
        const formContainer = document.querySelector(".form-container");
        formContainer.classList.add("animate__animated", "animate__shakeX");
        setTimeout(() => formContainer.classList.remove("animate__shakeX"), 1000);
      });
    });






    document.addEventListener('DOMContentLoaded', () => {
      const seeMoreButton = document.getElementById('see-more-button');
      const allComments = document.querySelectorAll('.comment');
  
      if (seeMoreButton) {
        seeMoreButton.addEventListener('click', () => {
          // Show all hidden comments
          allComments.forEach(comment => {
            comment.style.display = 'block';
          });
  
          // Hide the "See More" button after displaying all comments
          seeMoreButton.style.display = 'none';
        });
      }
    });
  



// map   


