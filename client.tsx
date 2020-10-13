import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { FetchPolicy, ErrorPolicy } from './policyConstants';

interface IConfigurations {
  name?: string,
  version?: string,
  uri: string,
  onNetworkError: Function,
  onGraphqlErrors: Function,
  fetchPolicy?: FetchPolicy,
  errorPolicy?: ErrorPolicy
}

class Client {
  private getErrorLink(onNetworkError: Function, onGraphqlErrors: Function) {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.error(
            `*********[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
        onGraphqlErrors?.(graphQLErrors);
      }
      if (networkError) {
        console.error(`*********[Network error]: ${networkError}`);
        onNetworkError?.(networkError);
      }
    });
    return errorLink;
  }

  private getTrackLink() {
    return new ApolloLink((operation, forward) => {
      console.log(`Operation Name: ${operation.operationName}, 
        Request: ${operation.variables ? JSON.stringify(operation.variables) : ''}, 
        Time: ${Date.now()}`);
      return forward(operation);
    });
  }

  private getHttpLink(uri: string) {
    return createHttpLink({
      uri, //'https://graphql-weather-api.herokuapp.com/',
      // credentials: 'include'
    });
  }

  public getApolloClient(configurations: IConfigurations) {
    const errorLink = this.getErrorLink(configurations.onNetworkError, configurations.onGraphqlErrors)
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, this.getTrackLink(), this.getHttpLink(configurations.uri)]),
    
      name: configurations?.name || '',
      version: configurations?.version || '',
      defaultOptions: {
        watchQuery: {
          fetchPolicy: configurations.fetchPolicy || FetchPolicy.CACHE_FIRST,
          errorPolicy: configurations.errorPolicy || ErrorPolicy.ALL
        },
        query: {
          fetchPolicy: FetchPolicy.NETWORK_ONLY,
          errorPolicy: configurations.errorPolicy || ErrorPolicy.ALL
        },
        mutate: {
          fetchPolicy: FetchPolicy.NO_CACHE,
          errorPolicy: configurations.errorPolicy || ErrorPolicy.ALL
        }
      }
    });
  }
}

export default Client;


