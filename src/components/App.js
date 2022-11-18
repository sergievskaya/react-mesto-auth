import {useState, useEffect} from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import api from '../utils/api';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        Promise.all([api.getUserInfo(), api.getInitialCards()])
          .then(([userData, initialCards]) => {
            setCards(initialCards);
            setCurrentUser(userData);
          })
          .catch((err) => {
            console.log(`Ошибка: ${err}`);
          });
    }, []);

    function  handleEditAvatarClick()  {
        setIsEditAvatarPopupOpen(true);
    }
    
    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }
    
    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function closeAllPopups() {
        setIsEditAvatarPopupOpen(false);
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setSelectedCard({});
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleCardLike(card) {
        // Снова проверяем, есть ли уже лайк на этой карточке
        const isLiked = card.likes.some(i => i._id === currentUser._id);      
        // Отправляем запрос в API и получаем обновлённые данные карточки
        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    function handleCardDelete(card) {
        api.deleteCard(card._id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== card._id));
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    function handleUpdateUser(newUserData) {
        setIsLoading(true);
        api.setUserInfo(newUserData)
            .then((userData) => {
                setCurrentUser(userData);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function handleUpdateAvatar(newUserData) {
        setIsLoading(true);
        api.setUserAvatar(newUserData)
            .then((userData) => {
                setCurrentUser(userData);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function handleAddPlaceSubmit(card) {
        setIsLoading(true);
        api.addNewCard(card)
            .then((newCard) => {
                setCards([newCard, ...cards]);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
    <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
            <Header />
            <Main
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                cards={cards}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
            />
            <Footer />
            
            <EditProfilePopup 
                isOpen={isEditProfilePopupOpen}
                onClose={closeAllPopups}
                onUpdateUser={handleUpdateUser}
                isLoading={isLoading}
            />

            <EditAvatarPopup 
                isOpen={isEditAvatarPopupOpen} 
                onClose={closeAllPopups}
                onUpdateAvatar={handleUpdateAvatar}
                isLoading={isLoading}
            />

            <AddPlacePopup 
                isOpen={isAddPlacePopupOpen}
                onClose={closeAllPopups}
                onAddPlace={handleAddPlaceSubmit}
            />

            <ImagePopup 
                card={selectedCard}
                onClose={closeAllPopups}
            />
        </div>
    </CurrentUserContext.Provider>   
    );
}

export default App;