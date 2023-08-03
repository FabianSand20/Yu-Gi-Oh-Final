// Server.js

$(document).ready(function() {
  function showMessage(message) {
    $('#message').text(message);
  }
  
  // Función para realizar una solicitud AJAX
  async function makeRequest(options) {
    try {
      const response = await $.ajax(options);
      return response;
    } catch (error) {
      throw new Error(error.responseJSON.message || 'Error en la solicitud.');
    }
  }

  // Función para agregar una nueva carta
  async function addCard(formData) {
    try {
      const response = await makeRequest({
        type: 'POST',
        url: '/api/cards',
        data: JSON.stringify(formData),
        contentType: 'application/json',
      });

      showMessage('Carta creada exitosamente');
      $('#cardForm')[0].reset();

      return response;
    } catch (error) {
      showMessage(error.message);
    }
  }

  // Función para cargar o buscar cartas
  async function loadOrSearchCards(searchTerm, page = 1) {
    try {
      const cardsPerPage = 10;
      const offset = (page - 1) * cardsPerPage;
      let url = `/api/cards?offset=${offset}&limit=${cardsPerPage}`;
  
      if (searchTerm && searchTerm.trim() !== '') {
        url = `/api/cards/search?term=${encodeURIComponent(searchTerm.toLowerCase())}`;
      }
  
      // Solicitud del GET para obtener todas las cartas o cartas buscadas
      const cards = await makeRequest({
        type: 'GET',
        url: url,
      });

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
      showMessage(error.message);
    }
  }

  // Evento de envío del formulario de cartas
  $('#cardForm').submit(function(event) {
    event.preventDefault();

    const formData = {
      cardType: $('#cardType').val(),
      cardName: $('#cardName').val(),
      cardDescription: $('#cardDescription').val(),
      battlePoints: $('#cardBattlePoints').val(),
    };

    // Función para agregar una nueva carta
    addCard(formData);
  });

  // Botón de búsqueda
  $('#searchButton').click(function() {
    const searchTerm = $('#searchTerm').val();
    // Función para cargar o buscar cartas
    loadOrSearchCards(searchTerm);
  });
  
  // Botón de cargar todas las cartas
  $('#loadCards').click(function() {
    // Función para cargar todas las cartas
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

  // Función para cargar los detalles de la carta seleccionada en el formulario de edición
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

$('#cardTable').on('click', '.editButton', function() {
  const cardId = $(this).closest('tr').data('card-id');
  loadCardDetails(cardId); 
});

  // Función para enviar una solicitud PUT para actualizar la carta
  async function updateCard(cardId, formData) {
    try {
      const response = await makeRequest({
        type: 'PUT',
        url: `/api/cards/${cardId}`,
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

  // Botón de página anterior
  $('#prevPage').click(function() {
    if (currentPage > 1) {
      currentPage--;
      loadOrSearchCards(null, currentPage);
      $('#currentPage').text(`Página ${currentPage}`);
    }
  });

  // Botón de página siguiente
  $('#nextPage').click(function() {
    currentPage++;
    loadOrSearchCards(null, currentPage);
    $('#currentPage').text(`Página ${currentPage}`);
  });
  

  // Formulario de edición de cartas
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

  // Solicitud DELETE para eliminar la carta
  async function deleteCard(cardId) {
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
  

  // Botón "Delete Card"
  $('#cardTable').on('click', '.deleteButton', function() {
    const cardId = $(this).closest('tr').data('card-id');
    deleteCard(cardId);
  });
});
