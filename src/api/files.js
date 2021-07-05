const post = async (file) => {
    const url = 'http://localhost:5001/api/files';

    let formData = new FormData();

    formData.append('file', file)

    return fetch(url, {
        method: 'POST',
        body: formData
    });
}

const get = async (query) => {
    let url;

    if(query && query.id) {
        url = `http://localhost:5001/api/files?id=${query.id}`;
    }

    else {
        url = 'http://localhost:5001/api/files';
    }

    return fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

const put = async (query) => {
    let url;

    if(query && query.name === 'trash'){
        url = `http://localhost:5001/api/files?id=${query.id}&trash=${query.trash}`;
    }

    else if (query && query.name === 'starred'){
        url = `http://localhost:5001/api/files?id=${query.id}&starred=${query.starred}`;
    }

    return fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT'
    });
}

export default {
    post,
    get,
    put
}
