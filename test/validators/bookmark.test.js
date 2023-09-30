import Joi from 'joi';
import {
    createBookmarkDataValidator,
    bookmarkIdValidator,
    tagIdValidator,
    updateBookmarkDataValidator,
    deleteBookmarkDataValidator,
} from '../../validators/bookmark.js';
import { objectValidator, singleValidator } from '../../validators/basic_validators';
import { ValidationError } from '../../util/error';

describe('createBookmarkDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { link: 'https://www.google.com', directoryId: 1, type: 'img', favorite: true } };
        const reply = {};
        const next = jest.fn();

        const value = { link: 'https://www.google.com', directoryId: 1, type: 'img', favorite: true };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        createBookmarkDataValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { link: 'google', ownerId: 1, directoryId: 1, type: 'article', favorite: true } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        createBookmarkDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('bookmarkIdValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { id: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = 1;
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        bookmarkIdValidator(req, reply, next);

        expect(req.body.value).toEqual({ bookmarkId: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: { id: 'a' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        bookmarkIdValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('tagIdValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { tagId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = 1;
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        tagIdValidator(req, reply, next);

        expect(req.body.value).toEqual({ tagId: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: { tagId: 'a' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        tagIdValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('updateBookmarkDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { changes: [{ id: 1, link: 'https://www.google.com', directoryId: 1, type: 'img', favorite: true }] } };
        const reply = {};
        const next = jest.fn();

        const value = [{ id: 1, link: 'https://www.google.com', directoryId: 1, type: 'img', favorite: true }];
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        updateBookmarkDataValidator(req, reply, next);

        expect(req.body.value).toEqual({ changes: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { changes: [{ id: '1', link: 'google', directory_id: 1, type: 'tag', favorite: true }] } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        updateBookmarkDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('deleteBookmarkDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { query: { ids: '[1,2,3]' } };
        const reply = {};
        const next = jest.fn();

        const value = [1, 2, 3];
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        deleteBookmarkDataValidator(req, reply, next);

        expect(req.body.value).toEqual({ ids: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { query: {} };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        deleteBookmarkDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});