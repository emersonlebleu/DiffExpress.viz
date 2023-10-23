import $ from 'jquery';

export default async function fetchFileOnline(url) {
    try {
        //Using this promise structure so we dont block the main thread
        let resultData = await new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'text',
                success: function(data, textStatus, xhr) {
                    resolve({
                        text: data,
                        format: xhr.getResponseHeader('Content-Type')
                    });
                },
                error: function(xhr, textStatus, errorThrown) {
                    reject(new Error(errorThrown));
                }
            });
        });
        return resultData;
    } catch (error) {
        throw error;  // or return error; depending on how you want to handle errors
    }
}