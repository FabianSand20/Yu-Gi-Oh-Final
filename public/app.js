// Server.js

$(document).ready(function() {
  // Función para mostrar un mensaje en el elemento #message
  function showMessage(message) {
    $('#message').text(message);
  }
  
  // Función para realizar una solicitud AJAX
  async function makeRequest(options) {
    try {
      // Utilizamos async/await para realizar la solicitud AJAX
      const response = await $.ajax(options);
      return response;
    } catch (error) {
      // Si hay un error en la solicitud, lanzamos una excepción con un mensaje personalizado
      throw new Error(error.responseJSON.message || 'Error en la solicitud.');
    }
  }

  // Función para agregar una nueva carta
  async function addCard(formData) {
    try {
      // Hacemos una solicitud POST para agregar una nueva carta
      const response = await makeRequest({
        type: 'POST',
        url: '/api/cards',
        data: JSON.stringify(formData),
        contentType: 'application/json',
      });

      // Mostramos un mensaje de éxito y limpiamos el formulario
      showMessage('Carta creada exitosamente');
      $('#cardForm')[0].reset();

      return response;
    } catch (error) {
      // Si hay un error, mostramos un mensaje con el error en el #message element
      showMessage(error.message);
    }
  }

  // Función para cargar o buscar cartas
  async function loadOrSearchCards(searchTerm, page = 1) {
    try {
      const cardsPerPage = 10;
      const offset = (page - 1) * cardsPerPage;
      let url = `/api/cards?offset=${offset}&limit=${cardsPerPage}`;
  
      // Si se proporciona un término de búsqueda válido, actualizamos la URL para buscar cartas
      if (searchTerm && searchTerm.trim() !== '') {
        url = `/api/cards/search?term=${encodeURIComponent(searchTerm.toLowerCase())}`;
      }
  
      // Hacemos una solicitud GET para obtener todas las cartas o cartas buscadas
      const cards = await makeRequest({
        type: 'GET',
        url: url,
      });

      // Vaciamos el contenido de la tabla y mostramos las cartas en la tabla
      $('#cardTable tbody').empty();
      if (cards.length === 0) {
        showMessage('No se encontraron cartas con el término de búsqueda.');
      } else {
        cards.forEach(function(card) {
          const row = `<tr data-card-id="${card._id}">
                        <td>${card.cardType}</td>
                        <td>${card.cardName}</td>
                        <td>${card.cardDescription}</td>
                        <td>${card.battlePoints}</td>
                        <td><button class="editButton">Edit</button> <button class="deleteButton">Delete</button></td>
                      </tr>`;
          $('#cardTable tbody').append(row);
        });
      }
    } catch (error) {
      // Si hay un error, mostramos un mensaje con el error en el #message element
      showMessage(error.message);
    }
  }

  // Manejo del evento de envío del formulario de cartas
  $('#cardForm').submit(function(event) {
    event.preventDefault();

    const formData = {
      cardType: $('#cardType').val(),
      cardName: $('#cardName').val(),
      cardDescription: $('#cardDescription').val(),
      battlePoints: $('#cardBattlePoints').val(),
    };

    // Llamamos a la función para agregar una nueva carta
    addCard(formData);
  });

  // Manejo del evento de clic en el botón de búsqueda
  $('#searchButton').click(function() {
    const searchTerm = $('#searchTerm').val();
    // Llamamos a la función para cargar o buscar cartas
    loadOrSearchCards(searchTerm);
  });
  
  // Manejo del evento de clic en el botón de cargar todas las cartas
  $('#loadCards').click(function() {
    // Llamamos a la función para cargar todas las cartas
    loadOrSearchCards();
  });

  // Función para mostrar el formulario de edición de cartas con los detalles de la carta seleccionada
  function showEditForm(card) {
    $('#editCardType').val(card.cardType);
    $('#editCardName').val(card.cardName);
    $('#editCardDescription').val(card.cardDescription);
    $('#editCardBattlePoints').val(card.battlePoints);
    $('#editCardForm').show().data('card-id', card._id);
  }

  // Función para cargar los detalles de la carta seleccionada en el formulario de edición// Función para cargar los detalles de la carta seleccionada en el formulario de edición
  async function loadCardDetails(cardId) {
    try {
      const card = await makeRequest({
        type: 'GET',
        url: `/api/cards/${cardId}`,
      });
      showEditForm(card);
    } catch (error) {
      showMessage(error.message);
    }
  }

// Manejo del evento de clic en una fila de la tabla para cargar detalles de la carta en el formulario de edición
$('#cardTable').on('click', '.editButton', function() {
  const cardId = $(this).closest('tr').data('card-id');
  loadCardDetails(cardId); // Pasar el cardId como argumento a loadCardDetails
});

  // Función para enviar una solicitud PUT para actualizar la carta
  async function updateCard(cardId, formData) {
    try {
      const response = await makeRequest({
        type: 'PUT',
        url: `/api/cards/${cardId}`, // Agregar el cardId en la URL
        data: JSON.stringify(formData),
        contentType: 'application/json',
      });
  
      showMessage('Carta actualizada exitosamente');
      $('#editCardForm').hide();
      loadOrSearchCards();
    } catch (error) {
      showMessage(error.message);
    }
  }

  let currentPage = 1;

  // Manejo del evento de clic en el botón de página anterior
  $('#prevPage').click(function() {
    if (currentPage > 1) {
      currentPage--;
      loadOrSearchCards(null, currentPage);
      $('#currentPage').text(`Página ${currentPage}`);
    }
  });

  // Manejo del evento de clic en el botón de página siguiente
  $('#nextPage').click(function() {
    currentPage++;
    loadOrSearchCards(null, currentPage);
    $('#currentPage').text(`Página ${currentPage}`);
  });
  

  // Manejo del evento de envío del formulario de edición de cartas
  $('#editCardForm').submit(function(event) {
    event.preventDefault();

    const cardId = $(this).data('card-id');
    const formData = {
      cardType: $('#editCardType').val(),
      cardName: $('#editCardName').val(),
      cardDescription: $('#editCardDescription').val(),
      battlePoints: $('#editCardBattlePoints').val(),
    };

    updateCard(cardId, formData);
  });

  // Función para enviar una solicitud DELETE para eliminar la carta
  async function deleteCard(cardId) {
    // Verificar si el cardId es una cadena de 24 caracteres hexadecimales
    if (/^[0-9a-fA-F]{24}$/.test(cardId)) {
      try {
        const response = await makeRequest({
          type: 'DELETE',
          url: `/api/cards/${cardId}`,
        });
  
        showMessage('Carta eliminada exitosamente');
        $('#editCardForm').hide();
        loadOrSearchCards();
      } catch (error) {
        showMessage(error.message);
      }
    } else {
      showMessage('ID de carta no válido');
    }
  }
  

  // Manejo del evento de clic en el botón "Delete Card"
  $('#cardTable').on('click', '.deleteButton', function() {
    const cardId = $(this).closest('tr').data('card-id');
    deleteCard(cardId);
  });
});
