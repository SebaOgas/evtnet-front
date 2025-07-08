import { HttpRequestType, request } from "$lib/request/request";

export const TestService = {
    endpoint: async () => {
        let response = await request(HttpRequestType.GET, "path/endpoint");
        return response;
    }
}