import {
    addTagValidator,
    removeTagValidator,
    bookmarkIdValidator,
    updateTagNameValidator
} from '../../validators/tag.js';
import { objectValidator, singleValidator } from '../../validators/basic_validators';
import { ValidationError } from '../../util/error.js';

describe('addTagValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { name: 'tag1', bookmarkId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = { name: 'tag1', bookmarkId: 1 };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        addTagValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { name: 'tag1' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        addTagValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('removeTagValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { bookmarkId: 1, tagId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = { bookmarkId: 1, tagId: 1 };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        removeTagValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { bookmarkId: 1 } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        removeTagValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('bookmarkIdValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { bookmarkId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = 1;
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        bookmarkIdValidator(req, reply, next);

        expect(req.body.value).toEqual({ bookmarkId: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: { bookmarkId: 'a' } };
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

describe('updateTagNameValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { tagId: 1, newName: 'newTag' } };
        const reply = {};
        const next = jest.fn();

        const value = { tagId: 1, newName: 'newTag' };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        updateTagNameValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { tagId: 'a' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        updateTagNameValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});