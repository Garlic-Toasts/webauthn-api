# Демонстрация работы стандарта WebAuthN

Команда **Garlic Toasts**
### Ссылка на сервис: https://garlictoasts.ru 

## Репозитории

- [Репозиторий бэкенда](https://github.com/Garlic-Toasts/webauthn-api) (this)
- [Репозиторий фронтенда](https://github.com/Garlic-Toasts/webauthn-frontend)

## Презентация

Презентация находится в [presentation.pdf](presentation.pdf). Динамическая версия на всякий случай,  [Google Slides](https://docs.google.com/presentation/d/1pgkVqZvqq5UliIxUKwPUMQZcPeg0RCW51TZRGIZfaus/edit?usp=sharing).

## Структура проекта
1. **PrismaORM** - взаимодействие с PostgreSQL. Используется для хранения аккаунтов и ключей доступа (Passkey).
2. **Redis** - используется для хранения конфигураций авторизации пользователей (Options).
3. **Auth модуль** - весь процесс регистрации и авторизации, сохранение бользователей и ключей доступа.
4. **Profile модуль** - получение профиля пользователя
5. **Session модуль** - управление сессиями пользователя

Спасибо за ознакомление с нашим проектом! 🚀
